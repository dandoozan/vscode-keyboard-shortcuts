import { ExtensionContext } from 'vscode';
import {
    generateAst,
    getCurrentEditor,
    getTextOfFile,
    getLanguage,
    getCursorLocation,
    addCommand,
    deleteBetweenBoundary,
    filterAst,
    isCursorInsideNode,
    getBoundaryExcludingBraces,
    isString,
} from './utils';
import { Node } from '@babel/types';

function findEnclosingStringBoundary(ast: Node, cursorLocation: number) {
    const enclosingStringNode = filterAst(
        ast,
        node => isString(node) && isCursorInsideNode(cursorLocation, node)
    )[0];

    const stringBoundary = getBoundaryExcludingBraces(enclosingStringNode);

    return stringBoundary;
}

async function deleteInnerString() {
    const editor = getCurrentEditor();

    if (editor) {
        const ast = generateAst(getTextOfFile(editor), getLanguage(editor));
        if (ast) {
            const stringBoundary = findEnclosingStringBoundary(
                ast,
                getCursorLocation(editor)
            );

            //remove the string
            if (stringBoundary) {
                await deleteBetweenBoundary(editor, stringBoundary);
            }
        }
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    addCommand('vks.deleteInnerString', deleteInnerString, context);
}

// this method is called when your extension is deactivated
export function deactivate() {}
