import { ExtensionContext, TextEditor } from 'vscode';
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
    getInnerBoundary,
} from './utils';
import { Node, isStringLiteral, isTemplateLiteral } from '@babel/types';


function isString(node: Node) {
    return isStringLiteral(node) || isTemplateLiteral(node);
}

function findEnclosingStringBoundary(
    editor: TextEditor,
    cursorLocation: number
) {
    const ast = generateAst(getTextOfFile(editor), getLanguage(editor));

    //find the string that i'm in
    const enclosingStringNode = filterAst(
        ast,
        (node: Node) =>
            isString(node) && isCursorInsideNode(cursorLocation, node)
    )[0];

    const stringBoundary = getInnerBoundary(enclosingStringNode);

    return stringBoundary;
}

async function deleteInnerString() {
    const editor = getCurrentEditor();

    if (editor) {
        const stringBoundary = findEnclosingStringBoundary(
            editor,
            getCursorLocation(editor)
        );

        //remove the string
        if (stringBoundary) {
            await deleteBetweenBoundary(editor, stringBoundary);
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
