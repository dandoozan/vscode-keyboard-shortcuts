import { equal } from 'assert';
import { workspace, window } from 'vscode';
import { deleteInnerString, replaceString } from '../extension';
import { setCursor, writeToClipboard } from '../utils';

//tests i should make for findEnclosingStringBoundary:
//"double quote string"
//  -begin, middle, end
//'single quote string'
//  -begin, middle, end
//`template string`
//  -begin, middle, end
//  -with cursor inside string inside expression
//'use strict'
//  -begin, middle, end
//other
//  -cursor not inside a string

describe('deleteInnerString', () => {
    //tests to make:
    //"double quote string"
    //'single quote string'
    //`template string`
    //  -with cursor inside string inside expression
    //'use strict'
    //other
    //  -cursor not inside a string
    //  -multicursor

    it('should delete double-quote string', async () => {
        const startingCode = '("Four score and seven years ago...")';
        const expectedEndingCode = '("")';
        const cursorPosition = 2; //<-- just inside the opening quote

        const doc = await workspace.openTextDocument({
            content: startingCode,
            language: 'javascript',
        });

        //show it so that it's the "activeTextEditor"
        const editor = await window.showTextDocument(doc);
        await setCursor(editor, cursorPosition);

        await deleteInnerString(editor);
        equal(doc.getText(), expectedEndingCode);
    });

    it('should delete single-quote string', async () => {
        const startingCode = "('Four score and seven years ago...')";
        const expectedEndingCode = "('')";
        const cursorPosition = 2; //<-- just inside the opening quote

        const doc = await workspace.openTextDocument({
            content: startingCode,
            language: 'javascript',
        });

        //show it so that it's the "activeTextEditor"
        const editor = await window.showTextDocument(doc);
        await setCursor(editor, cursorPosition);

        await deleteInnerString(editor);
        equal(doc.getText(), expectedEndingCode);
    });

    it('should delete template string', async () => {
        const startingCode = '(`Four score and seven years ago...`)';
        const expectedEndingCode = '(``)';
        const cursorPosition = 2; //<-- just inside the opening quote

        const doc = await workspace.openTextDocument({
            content: startingCode,
            language: 'javascript',
        });

        //show it so that it's the "activeTextEditor"
        const editor = await window.showTextDocument(doc);
        await setCursor(editor, cursorPosition);

        await deleteInnerString(editor);
        equal(doc.getText(), expectedEndingCode);
    });

    it('should delete string inside template string', async () => {
        const startingCode = '(`${"Four score and seven years ago..."}`)';
        const expectedEndingCode = '(`${""}`)';
        const cursorPosition = 5; //<-- just inside the opening quote

        const doc = await workspace.openTextDocument({
            content: startingCode,
            language: 'javascript',
        });

        //show it so that it's the "activeTextEditor"
        const editor = await window.showTextDocument(doc);
        await setCursor(editor, cursorPosition);

        await deleteInnerString(editor);
        equal(doc.getText(), expectedEndingCode);
    });

    it('should delete directive', async () => {
        const startingCode = '"use strict"';
        const expectedEndingCode = '""';
        const cursorPosition = 1; //<-- just inside the opening quote

        const doc = await workspace.openTextDocument({
            content: startingCode,
            language: 'javascript',
        });

        //show it so that it's the "activeTextEditor"
        const editor = await window.showTextDocument(doc);
        await setCursor(editor, cursorPosition);

        await deleteInnerString(editor);
        equal(doc.getText(), expectedEndingCode);
    });

    it('should NOT delete when cursor is not inside a string', async () => {
        const startingCode = '("Four score and seven years ago...")';
        const expectedEndingCode = '("Four score and seven years ago...")';
        const cursorPosition = 0;

        const doc = await workspace.openTextDocument({
            content: startingCode,
            language: 'javascript',
        });

        //show it so that it's the "activeTextEditor"
        const editor = await window.showTextDocument(doc);
        await setCursor(editor, cursorPosition);

        await deleteInnerString(editor);
        equal(doc.getText(), expectedEndingCode);
    });

    it('should delete strings when multiple cursors are inside strings', async () => {
        const startingCode = '("Four score" + "and seven years ago...")';
        const expectedEndingCode = '("" + "")';
        const cursorPositions = [2, 17];

        const doc = await workspace.openTextDocument({
            content: startingCode,
            language: 'javascript',
        });

        //show it so that it's the "activeTextEditor"
        const editor = await window.showTextDocument(doc);
        await setCursor(editor, cursorPositions);

        await deleteInnerString(editor);
        equal(doc.getText(), expectedEndingCode);
    });
});

describe('replaceString', () => {
    //tests to make:
    //"double quote string"
    //'single quote string'
    //`template string`
    //  -with cursor inside string inside expression
    //'use strict'
    //other
    //  -cursor not inside a string (what should it do? still paste?)
    //  -multicursor

    it('should replace double-quote string', async () => {
        const clipboardContent = '87 years ago...';
        await writeToClipboard(clipboardContent);

        const startingCode = '("Four score and seven years ago...")';
        const expectedEndingCode = `("${clipboardContent}")`;
        const cursorPosition = 2; //<-- just inside the opening quote

        const doc = await workspace.openTextDocument({
            content: startingCode,
            language: 'javascript',
        });

        //show it so that it's the "activeTextEditor"
        const editor = await window.showTextDocument(doc);
        await setCursor(editor, cursorPosition);

        await replaceString(editor);
        equal(doc.getText(), expectedEndingCode);
    });

    it('should replace single-quote string', async () => {
        const clipboardContent = '87 years ago...';
        await writeToClipboard(clipboardContent);

        const startingCode = "('Four score and seven years ago...')";
        const expectedEndingCode = `('${clipboardContent}')`;
        const cursorPosition = 2; //<-- just inside the opening quote

        const doc = await workspace.openTextDocument({
            content: startingCode,
            language: 'javascript',
        });

        //show it so that it's the "activeTextEditor"
        const editor = await window.showTextDocument(doc);
        await setCursor(editor, cursorPosition);

        await replaceString(editor);
        equal(doc.getText(), expectedEndingCode);
    });

    it('should replace template string', async () => {
        const clipboardContent = '87 years ago...';
        await writeToClipboard(clipboardContent);

        const startingCode = '(`Four score and seven years ago...`)';
        const expectedEndingCode = `(\`${clipboardContent}\`)`;
        const cursorPosition = 2; //<-- just inside the opening quote

        const doc = await workspace.openTextDocument({
            content: startingCode,
            language: 'javascript',
        });

        //show it so that it's the "activeTextEditor"
        const editor = await window.showTextDocument(doc);
        await setCursor(editor, cursorPosition);

        await replaceString(editor);
        equal(doc.getText(), expectedEndingCode);
    });

    it('should replace string inside template string', async () => {
        const clipboardContent = '87 years ago...';
        await writeToClipboard(clipboardContent);

        const startingCode = '(`${"Four score and seven years ago..."}`)';
        const expectedEndingCode = `(\`\${"${clipboardContent}"}\`)`;
        const cursorPosition = 5; //<-- just inside the opening quote

        const doc = await workspace.openTextDocument({
            content: startingCode,
            language: 'javascript',
        });

        //show it so that it's the "activeTextEditor"
        const editor = await window.showTextDocument(doc);
        await setCursor(editor, cursorPosition);

        await replaceString(editor);
        equal(doc.getText(), expectedEndingCode);
    });

    it('should replace directive', async () => {
        const clipboardContent = '87 years ago...';
        await writeToClipboard(clipboardContent);

        const startingCode = '"use strict"';
        const expectedEndingCode = `"${clipboardContent}"`;
        const cursorPosition = 1; //<-- just inside the opening quote

        const doc = await workspace.openTextDocument({
            content: startingCode,
            language: 'javascript',
        });

        //show it so that it's the "activeTextEditor"
        const editor = await window.showTextDocument(doc);
        await setCursor(editor, cursorPosition);

        await replaceString(editor);
        equal(doc.getText(), expectedEndingCode);
    });

    it('should NOT replace when cursor is not inside a string', async () => {
        const clipboardContent = '87 years ago...';
        await writeToClipboard(clipboardContent);

        const startingCode = '("Four score and seven years ago...")';
        const expectedEndingCode = `("Four score and seven years ago...")`;
        const cursorPosition = 0;

        const doc = await workspace.openTextDocument({
            content: startingCode,
            language: 'javascript',
        });

        //show it so that it's the "activeTextEditor"
        const editor = await window.showTextDocument(doc);
        await setCursor(editor, cursorPosition);

        await replaceString(editor);
        equal(doc.getText(), expectedEndingCode);
    });

    it('should replace strings when multiple cursors are inside strings', async () => {
        const clipboardContent = '87 years ago...';
        await writeToClipboard(clipboardContent);

        const startingCode = '("Four score" + "and seven years ago...")';
        const expectedEndingCode = `("${clipboardContent}" + "${clipboardContent}")`;
        const cursorPositions = [2, 17];

        const doc = await workspace.openTextDocument({
            content: startingCode,
            language: 'javascript',
        });

        //show it so that it's the "activeTextEditor"
        const editor = await window.showTextDocument(doc);
        await setCursor(editor, cursorPositions);

        await replaceString(editor);
        equal(doc.getText(), expectedEndingCode);
    });
});
