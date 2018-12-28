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
import { maxBy } from 'lodash';

function findEnclosingStringBoundary(ast: Node, cursorLocation: number) {
    //there could be several enclosing strings (if, for example, there's a string
    //expression inside a template literal (eg. `Outer string ${'Inner string'}`))
    const enclosingStringNodes = filterAst(
        ast,
        node => isString(node) && isCursorInsideNode(cursorLocation, node)
    );

    //so get the most enclosing one by finding the one with the last "start" value
    const mostEnclosingStringNode = maxBy(enclosingStringNodes, 'start');

    //finally, get the boundary (and exclude the " (quote symbols) around it)
    const stringBoundary = getBoundaryExcludingBraces(mostEnclosingStringNode);

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
