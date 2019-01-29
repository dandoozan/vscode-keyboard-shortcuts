import { strictEqual } from 'assert';
import { workspace, window, commands } from 'vscode';
import { commandConfig, executeCommand } from '../extension';
import { setCursor, writeToClipboard, getSelectedText } from '../utils';

//tests i should make for findEnclosingStringBoundary:
//"regular string"
//  -begin, middle, end
//`template string`
//  -begin, middle, end
//  -with cursor inside string inside expression
//'use strict'
//  -begin, middle, end
//other
//  -cursor not inside a string

async function runCommandInEditor(
    startingCode: string,
    cursorPosition: number | number[],
    commandName: string
) {
    const doc = await workspace.openTextDocument({
        content: startingCode,
        language: 'javascript',
    });

    //show the editor so that it's the "activeTextEditor"
    const editor = await window.showTextDocument(doc);
    await setCursor(editor, cursorPosition);
    await executeCommand.call({ commandName }, editor);

    return editor;
}

describe('selectString', () => {
    const command = 'selectString';
    const stringContents = 'Four score and seven years ago...';

    it('should select string', async () => {
        const startingCode = `("${stringContents}")`;
        const cursorPosition = 2; //<-- just inside the opening quote
        const editor = await runCommandInEditor(
            startingCode,
            cursorPosition,
            command
        );
        const selectedText = getSelectedText(editor);
        strictEqual(selectedText.length, 1);
        strictEqual(selectedText[0], stringContents);
    });

    it('should select template string', async () => {
        const startingCode = `(\`${stringContents}\`)`;
        const cursorPosition = 2; //<-- just inside the opening quote
        const editor = await runCommandInEditor(
            startingCode,
            cursorPosition,
            command
        );
        const selectedText = getSelectedText(editor);
        strictEqual(selectedText.length, 1);
        strictEqual(selectedText[0], stringContents);
    });

    it('should select string inside template string', async () => {
        const startingCode = `(\`\${"${stringContents}"}\`)`;
        const cursorPosition = 5; //<-- just inside the opening quote
        const editor = await runCommandInEditor(
            startingCode,
            cursorPosition,
            command
        );
        const selectedText = getSelectedText(editor);
        strictEqual(selectedText.length, 1);
        strictEqual(selectedText[0], stringContents);
    });
    it('should select directive', async () => {
        const startingCode = `"${stringContents}"`;
        const cursorPosition = 1; //<-- just inside the opening quote
        const editor = await runCommandInEditor(
            startingCode,
            cursorPosition,
            command
        );
        const selectedText = getSelectedText(editor);
        strictEqual(selectedText.length, 1);
        strictEqual(selectedText[0], stringContents);
    });

    it('should NOT select when cursor is not inside a string', async () => {
        const startingCode = `("${stringContents}")`;
        const cursorPosition = 0;
        const editor = await runCommandInEditor(
            startingCode,
            cursorPosition,
            command
        );
        const selectedText = getSelectedText(editor);
        strictEqual(selectedText.length, 1);
        strictEqual(selectedText[0], '');

    });

    it('should select strings when multiple cursors are inside strings', async () => {
        const startingCode = '("Four score" + "and seven years ago...")';
        const cursorPosition = [2, 17];
        const editor = await runCommandInEditor(
            startingCode,
            cursorPosition,
            command
        );
        const selectedText = getSelectedText(editor);
        strictEqual(selectedText.length, 2);
        strictEqual(selectedText[0], 'Four score')
        strictEqual(selectedText[1], 'and seven years ago...')
    });
});

describe('deleteString', () => {
    const command = 'deleteString';

    it('should delete string', async () => {
        const startingCode = '("Four score and seven years ago...")';
        const endingCode = '("")';
        const cursorPosition = 2; //<-- just inside the opening quote
        const editor = await runCommandInEditor(
            startingCode,
            cursorPosition,
            command
        );
        strictEqual(editor.document.getText(), endingCode);
    });

    it('should delete template string', async () => {
        const startingCode = '(`Four score and seven years ago...`)';
        const endingCode = '(``)';
        const cursorPosition = 2; //<-- just inside the opening quote
        const editor = await runCommandInEditor(
            startingCode,
            cursorPosition,
            command
        );
        strictEqual(editor.document.getText(), endingCode);
    });

    it('should delete string inside template string', async () => {
        const startingCode = '(`${"Four score and seven years ago..."}`)';
        const endingCode = '(`${""}`)';
        const cursorPosition = 5; //<-- just inside the opening quote
        const editor = await runCommandInEditor(
            startingCode,
            cursorPosition,
            command
        );
        strictEqual(editor.document.getText(), endingCode);
    });

    it('should delete directive', async () => {
        const startingCode = '"use strict"';
        const endingCode = '""';
        const cursorPosition = 1; //<-- just inside the opening quote
        const editor = await runCommandInEditor(
            startingCode,
            cursorPosition,
            command
        );
        strictEqual(editor.document.getText(), endingCode);
    });

    it('should NOT delete when cursor is not inside a string', async () => {
        const startingCode = '("Four score and seven years ago...")';
        const endingCode = '("Four score and seven years ago...")';
        const cursorPosition = 0;
        const editor = await runCommandInEditor(
            startingCode,
            cursorPosition,
            command
        );
        strictEqual(editor.document.getText(), endingCode);
    });

    it('should delete strings when multiple cursors are inside strings', async () => {
        const startingCode = '("Four score" + "and seven years ago...")';
        const endingCode = '("" + "")';
        const cursorPosition = [2, 17];
        const editor = await runCommandInEditor(
            startingCode,
            cursorPosition,
            command
        );
        strictEqual(editor.document.getText(), endingCode);
    });
});

describe('replaceString', () => {
    const command = 'replaceString';
    const clipboardContent = '87 years ago...';
    writeToClipboard(clipboardContent);

    it('should replace string', async () => {
        const startingCode = '("Four score and seven years ago...")';
        const endingCode = `("${clipboardContent}")`;
        const cursorPosition = 2; //<-- just inside the opening quote
        const editor = await runCommandInEditor(
            startingCode,
            cursorPosition,
            command
        );
        strictEqual(editor.document.getText(), endingCode);
    });

    it('should replace template string', async () => {
        const startingCode = '(`Four score and seven years ago...`)';
        const endingCode = `(\`${clipboardContent}\`)`;
        const cursorPosition = 2; //<-- just inside the opening quote
        const editor = await runCommandInEditor(
            startingCode,
            cursorPosition,
            command
        );
        strictEqual(editor.document.getText(), endingCode);
    });

    it('should replace string inside template string', async () => {
        const startingCode = '(`${"Four score and seven years ago..."}`)';
        const endingCode = `(\`\${"${clipboardContent}"}\`)`;
        const cursorPosition = 5; //<-- just inside the opening quote
        const editor = await runCommandInEditor(
            startingCode,
            cursorPosition,
            command
        );
        strictEqual(editor.document.getText(), endingCode);
    });

    it('should replace directive', async () => {
        const startingCode = '"use strict"';
        const endingCode = `"${clipboardContent}"`;
        const cursorPosition = 1; //<-- just inside the opening quote
        const editor = await runCommandInEditor(
            startingCode,
            cursorPosition,
            command
        );
        strictEqual(editor.document.getText(), endingCode);
    });

    it('should NOT replace when cursor is not inside a string', async () => {
        const startingCode = '("Four score and seven years ago...")';
        const endingCode = `("Four score and seven years ago...")`;
        const cursorPosition = 0;
        const editor = await runCommandInEditor(
            startingCode,
            cursorPosition,
            command
        );
        strictEqual(editor.document.getText(), endingCode);
    });

    it('should replace strings when multiple cursors are inside strings', async () => {
        const startingCode = '("Four score" + "and seven years ago...")';
        const endingCode = `("${clipboardContent}" + "${clipboardContent}")`;
        const cursorPosition = [2, 17];
        const editor = await runCommandInEditor(
            startingCode,
            cursorPosition,
            command
        );
        strictEqual(editor.document.getText(), endingCode);
    });
});
