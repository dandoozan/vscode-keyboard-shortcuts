import {
    ExtensionContext,
    TextDocument,
    TextEditor,
    TextEditorEdit,
} from 'vscode';
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
    addTextEditorCommand,
    readFromClipboard,
    createReplaceModification,
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

function getEnclosingStringBoundaries(editor: TextEditor) {
    let stringBoundaries: Boundary[] = [];

    const ast = generateAst(getTextOfFile(editor), getLanguage(editor));
    if (ast) {
        const cursors = getCursors(editor);
        stringBoundaries = cursors
            .map(cursor => findEnclosingStringBoundary(ast, cursor))
            .filter(item => item); //filter out the undefineds (an item is undefined when a cursor is not in a string)
    }

    return stringBoundaries;
}

export async function deleteInnerString(editor: TextEditor) {
    const enclosingStringBoundaries = getEnclosingStringBoundaries(editor);

    //create a "delete" modification for each string
    const modifications = enclosingStringBoundaries.map(stringBoundary =>
        createDeleteModification(editor.document, stringBoundary)
    );

    //do all the modifications
    await makeModifications(editor, modifications as Modification[]);
}
export async function replaceString(editor: TextEditor) {
    const enclosingStringBoundaries = getEnclosingStringBoundaries(editor);

    //create a "replace" modification for each string
    const modifications = enclosingStringBoundaries.map(stringBoundary =>
        createReplaceModification(editor.document, stringBoundary, readFromClipboard())
    );

    //do all the modifications
    await makeModifications(editor, modifications as Modification[]);
}

export function activate(context: ExtensionContext) {
    addTextEditorCommand('vks.deleteInnerString', deleteInnerString, context);
    addTextEditorCommand('vks.replaceString', replaceString, context);
}

export function deactivate() {}
