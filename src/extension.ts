import { ExtensionContext } from 'vscode';
import { addCommand, getCurrentEditor } from './utils';



function cutString() {
	const currentEditor = getCurrentEditor();

	if (currentEditor) {
		const ast = generateAST(getTextOfFile(currentEditor), getLanguage(currentEditor));

		//find the string that i'm in
		const enclosingStringNode = findEnclosingNodeOfType(ast, String);
		console.log('​cutString -> enclosingStringNode=', enclosingStringNode);

		const innerStringOffsetRange = getInnerStringOffsetRange(enclosingStringNode);

		//cut the contents
		cut(currentEditor, innerStringOffsetRange);
	}
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    addCommand('vks.cutString', cutString, context);
}

// this method is called when your extension is deactivated
export function deactivate() {}
