import { strictEqual } from 'assert';
import { workspace, window, commands } from 'vscode';
import { executeCommand } from '../extension';
import { setCursor, writeToClipboard, getSelectedText } from '../utils';

//tests i should make:
//-javascript
//  -string commands
//      -selectString
//          -'regular string'
//          -`template string`
//          -'directive' (ie. 'use strict')
//          -other
//              -cursor not inside a string
//              -multi cursor
//      -deleteString
//          ...
//      ...
//  -parameter commands
//      -selectParameter
//          -parameter
//      ...
//  ...
//-typescript
//  -selectString
//      -'regular string'
//      -`template string`
//      -'directive' (ie. 'use strict')
//      -other
//          -cursor not inside a string
//          -multi cursor
//  -deleteString
//      ...
//  ...
//-json
//  -selectString
//      -"key"
//      -"value"
//      -other
//          -cursor not inside a string
//          -multi cursor
//  -deleteString
//      ...
//  ...

async function runCommandInEditor(
    startingCode: string,
    cursorPosition: number | number[],
    commandName: string,
    language: string
) {
    const doc = await workspace.openTextDocument({
        content: startingCode,
        language,
    });

    //show the editor so that it's the "activeTextEditor"
    const editor = await window.showTextDocument(doc);
    await setCursor(editor, cursorPosition);
    await executeCommand.call({ commandName }, editor);

    return editor;
}

xdescribe('JavaScript', () => {
    const language = 'javascript';

    describe('selectString', () => {
        const command = 'selectString';
        const stringContents = 'Four score and seven years ago...';

        it('should select string', async () => {
            const startingCode = `("${stringContents}")`;
            const cursorPosition = 2; //<-- just inside the opening quote
            const editor = await runCommandInEditor(
                startingCode,
                cursorPosition,
                command,
                language
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
                command,
                language
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
                command,
                language
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
                command,
                language
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
                command,
                language
            );
            const selectedText = getSelectedText(editor);
            strictEqual(selectedText.length, 2);
            strictEqual(selectedText[0], 'Four score');
            strictEqual(selectedText[1], 'and seven years ago...');
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
                command,
                language
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
                command,
                language
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
                command,
                language
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
                command,
                language
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
                command,
                language
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
                command,
                language
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
                command,
                language
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
                command,
                language
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
                command,
                language
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
                command,
                language
            );
            strictEqual(editor.document.getText(), endingCode);
        });
    });
});

describe('JSON', () => {
    const language = 'json';

    describe('selectString', () => {
        const command = 'selectString';

        it('should select key', async () => {
            const startingCode = `{"key": "value"}`;
            const cursorPosition = startingCode.indexOf('key');
            const editor = await runCommandInEditor(
                startingCode,
                cursorPosition,
                command,
                language
            );
            const selectedText = getSelectedText(editor);
            strictEqual(selectedText.length, 1);
            strictEqual(selectedText[0], 'key');
        });

        it('should select value', async () => {
            const startingCode = `{"key": "value"}`;
            const cursorPosition = startingCode.indexOf('value');
            const editor = await runCommandInEditor(
                startingCode,
                cursorPosition,
                command,
                language
            );
            const selectedText = getSelectedText(editor);
            strictEqual(selectedText.length, 1);
            strictEqual(selectedText[0], 'value');
        });

        it('should NOT select when cursor is not inside a string', async () => {
            const startingCode = `{"key": "value"}`;
            const cursorPosition = 0;
            const editor = await runCommandInEditor(
                startingCode,
                cursorPosition,
                command,
                language
            );
            const selectedText = getSelectedText(editor);
            strictEqual(selectedText.length, 1);
            strictEqual(selectedText[0], '');
        });

        it('should select when multiple cursors are inside strings', async () => {
            const startingCode = `{"key": "value"}`;
            const cursorPosition = [startingCode.indexOf('key'), startingCode.indexOf('value')];
            const editor = await runCommandInEditor(
                startingCode,
                cursorPosition,
                command,
                language
            );
            const selectedText = getSelectedText(editor);
            strictEqual(selectedText.length, 2);
            strictEqual(selectedText[0], 'key');
            strictEqual(selectedText[1], 'value');
        });
    });
});
