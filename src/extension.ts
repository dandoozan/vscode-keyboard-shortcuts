import { ExtensionContext } from 'vscode';
import {
    generateAst,
    getCurrentEditor,
    getTextOfFile,
    getLanguage,
    findEnclosingStringNode,
    getCursorLocation,
    addCommand,
    deleteBetween,
    getNodeBoundaries,
} from './utils';
import { Node } from '@babel/types';

function getInnerStringBoundaries(stringNode: Node | undefined) {
    const nodeBoundaries = getNodeBoundaries(stringNode);
    if (nodeBoundaries) {
        return {
            start: nodeBoundaries.start + 1,
            end: nodeBoundaries.end - 1
        };
    }
}

async function deleteInnerString() {
    const currentEditor = getCurrentEditor();

    if (currentEditor) {
        const ast = generateAst(
            getTextOfFile(currentEditor),
            getLanguage(currentEditor)
        );

        //find the string that i'm in
        const enclosingStringNode = findEnclosingStringNode(
            ast,
            getCursorLocation(currentEditor)
        );

        const innerStringBoundaries = getInnerStringBoundaries(enclosingStringNode);

        //remove the string
        if (innerStringBoundaries) {
            await deleteBetween(
                currentEditor,
                innerStringBoundaries.start,
                innerStringBoundaries.end
            );
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
