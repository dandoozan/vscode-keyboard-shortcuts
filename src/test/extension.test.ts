import { equal } from 'assert';
import { workspace, window, commands } from 'vscode';
import { commandConfig, executeCommand } from '../extension';
import { setCursor, writeToClipboard } from '../utils';

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
    endingCode: string,
    cursorPosition: number | number[],
    command: string
) {
    const doc = await workspace.openTextDocument({
        content: startingCode,
        language: 'javascript',
    });

    //show it so that it's the "activeTextEditor"
    const editor = await window.showTextDocument(doc);
    await setCursor(editor, cursorPosition);

    await executeCommand(editor, command);
    equal(doc.getText(), endingCode);
}

describe('deleteInnerString', () => {
    const command = 'deleteInnerString';

    it('should delete double-quote string', async () => {
        const startingCode = '("Four score and seven years ago...")';
        const endingCode = '("")';
        const cursorPosition = 2; //<-- just inside the opening quote
        await runCommandInEditor(
            startingCode,
            endingCode,
            cursorPosition,
            command
        );
    });

    it('should delete template string', async () => {
        const startingCode = '(`Four score and seven years ago...`)';
        const endingCode = '(``)';
        const cursorPosition = 2; //<-- just inside the opening quote
        await runCommandInEditor(
            startingCode,
            endingCode,
            cursorPosition,
            command
        );
    });

    it('should delete string inside template string', async () => {
        const startingCode = '(`${"Four score and seven years ago..."}`)';
        const endingCode = '(`${""}`)';
        const cursorPosition = 5; //<-- just inside the opening quote
        await runCommandInEditor(
            startingCode,
            endingCode,
            cursorPosition,
            command
        );
    });

    it('should delete directive', async () => {
        const startingCode = '"use strict"';
        const endingCode = '""';
        const cursorPosition = 1; //<-- just inside the opening quote
        await runCommandInEditor(
            startingCode,
            endingCode,
            cursorPosition,
            command
        );
    });

    it('should NOT delete when cursor is not inside a string', async () => {
        const startingCode = '("Four score and seven years ago...")';
        const endingCode = '("Four score and seven years ago...")';
        const cursorPosition = 0;
        await runCommandInEditor(
            startingCode,
            endingCode,
            cursorPosition,
            command
        );
    });

    it('should delete strings when multiple cursors are inside strings', async () => {
        const startingCode = '("Four score" + "and seven years ago...")';
        const endingCode = '("" + "")';
        const cursorPosition = [2, 17];
        await runCommandInEditor(
            startingCode,
            endingCode,
            cursorPosition,
            command
        );
    });
});

describe('replaceString', () => {
    const command = 'replaceString';
    const clipboardContent = '87 years ago...';
    writeToClipboard(clipboardContent);

    it('should replace double-quote string', async () => {
        const startingCode = '("Four score and seven years ago...")';
        const endingCode = `("${clipboardContent}")`;
        const cursorPosition = 2; //<-- just inside the opening quote
        await runCommandInEditor(
            startingCode,
            endingCode,
            cursorPosition,
            command
        );
    });

    it('should replace template string', async () => {
        const startingCode = '(`Four score and seven years ago...`)';
        const endingCode = `(\`${clipboardContent}\`)`;
        const cursorPosition = 2; //<-- just inside the opening quote
        await runCommandInEditor(
            startingCode,
            endingCode,
            cursorPosition,
            command
        );
    });

    it('should replace string inside template string', async () => {
        const startingCode = '(`${"Four score and seven years ago..."}`)';
        const endingCode = `(\`\${"${clipboardContent}"}\`)`;
        const cursorPosition = 5; //<-- just inside the opening quote
        await runCommandInEditor(
            startingCode,
            endingCode,
            cursorPosition,
            command
        );
    });

    it('should replace directive', async () => {
        const startingCode = '"use strict"';
        const endingCode = `"${clipboardContent}"`;
        const cursorPosition = 1; //<-- just inside the opening quote
        await runCommandInEditor(
            startingCode,
            endingCode,
            cursorPosition,
            command
        );
    });

    it('should NOT replace when cursor is not inside a string', async () => {
        const startingCode = '("Four score and seven years ago...")';
        const endingCode = `("Four score and seven years ago...")`;
        const cursorPosition = 0;
        await runCommandInEditor(
            startingCode,
            endingCode,
            cursorPosition,
            command
        );
    });

    it('should replace strings when multiple cursors are inside strings', async () => {
        const startingCode = '("Four score" + "and seven years ago...")';
        const endingCode = `("${clipboardContent}" + "${clipboardContent}")`;
        const cursorPosition = [2, 17];
        await runCommandInEditor(
            startingCode,
            endingCode,
            cursorPosition,
            command
        );
    });
});
