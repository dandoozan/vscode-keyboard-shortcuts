import { ExtensionContext, TextDocument, TextEditor } from 'vscode';
import {
    generateAst,
    getCurrentEditor,
    getTextOfFile,
    getLanguage,
    getCursor,
    addCommand,
    deleteBetweenBoundary,
    filterAst,
    isCursorInsideNode,
    getBoundaryExcludingBraces,
    isString,
    getCursors,
    createDeleteModification,
    Modification,
    makeModifications,
    Boundary,
    paste,
} from './utils';
import { Node } from '@babel/types';
import { maxBy } from 'lodash';


function findEnclosingStringBoundary(ast: Node, cursorLocation: number) {
    let stringBoundary;

    //there could be several enclosing strings (if, for example, there's a string
    //expression inside a template literal (eg. `Outer string ${'Inner string'}`))
    const enclosingStringNodes = filterAst(
        ast,
        node => isString(node) && isCursorInsideNode(cursorLocation, node)
    );

    if (enclosingStringNodes.length > 0) {
        //so get the most enclosing one by finding the one with the last "start" value
        const mostEnclosingStringNode = maxBy(enclosingStringNodes, 'start');

        //finally, get the boundary (and exclude the " (quote symbols) around it)
        stringBoundary = getBoundaryExcludingBraces(mostEnclosingStringNode);
    }

    return stringBoundary;
}

async function applyFunctionToEnclosingStrings(fn: Function) {
    const editor = getCurrentEditor();
    if (editor) {
        const ast = generateAst(getTextOfFile(editor), getLanguage(editor));
        if (ast) {
            const cursors = getCursors(editor);
            const stringBoundaries = cursors.map(cursor =>
                findEnclosingStringBoundary(ast, cursor)
            );
            await fn(editor, stringBoundaries);
        }
    }
}

export async function deleteInnerString() {
    await applyFunctionToEnclosingStrings(
        async (editor: TextEditor, stringBoundaries: Boundary[]) => {
            //create a "delete" modification for each string
            const modifications = stringBoundaries.map(stringBoundary =>
                createDeleteModification(editor.document, stringBoundary)
            );

            //do all the modifications
            await makeModifications(editor, modifications as Modification[]);
        }
    );
}
export async function replaceString() {
    await deleteInnerString();
    await paste();
}

export function activate(context: ExtensionContext) {
    addCommand('vks.deleteInnerString', deleteInnerString, context);
    addCommand('vks.replaceString', replaceString, context);
}

export function deactivate() {}
