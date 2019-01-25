import { ExtensionContext, TextDocument } from 'vscode';
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

async function deleteInnerString() {
    await applyModificationFunctionToEnclosingStrings(createDeleteModification);
}

async function applyModificationFunctionToEnclosingStrings(modificationFunction: Function) {
    const editor = getCurrentEditor();

    if (editor) {
        const ast = generateAst(getTextOfFile(editor), getLanguage(editor));
        if (ast) {
            const cursors = getCursors(editor);
            const stringBoundaries = cursors.map(cursor =>
                findEnclosingStringBoundary(ast, cursor)
            );
            const modifications = stringBoundaries.map(stringBoundary =>
                modificationFunction(editor.document, stringBoundary)
            );

            //do all the modifications
            await makeModifications(editor, modifications);
        }
    }
}

export function activate(context: ExtensionContext) {
    addCommand('vks.deleteInnerString', deleteInnerString, context);
}

export function deactivate() {}
