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

describe('JavaScript', () => {
    const language = 'javascript';

    describe('selectString', () => {
        const command = 'selectString';
        const stringContents = 'Four score and seven years ago...';

        [
            {
                desc: 'should select string',
                startingCode: `("${stringContents}")`,
                cursorPosition: 2, //<-- just inside the opening quote
                expectedSelections: [`${stringContents}`],
            },
            {
                desc: 'should select template string',
                startingCode: `(\`${stringContents}\`)`,
                cursorPosition: 2, //<-- just inside the opening quote
                expectedSelections: [`${stringContents}`],
            },
            {
                desc: 'should select directive',
                startingCode: `"${stringContents}"`,
                cursorPosition: 1, //<-- just inside the opening quote
                expectedSelections: [`${stringContents}`],
            },
            {
                desc: 'should NOT select when cursor is not inside a string',
                startingCode: `("${stringContents}")`,
                cursorPosition: 0,
                expectedSelections: [''],
            },
            {
                desc:
                    'should select strings when multiple cursors are inside strings',
                startingCode: '("Four score" + "and seven years ago...")',
                cursorPosition: [2, 17],
                expectedSelections: ['Four score', 'and seven years ago...'],
            },
        ].forEach(
            ({ desc, startingCode, cursorPosition, expectedSelections }) => {
                it(desc, async () => {
                    const editor = await runCommandInEditor(
                        startingCode,
                        cursorPosition,
                        command,
                        language
                    );
                    const selections = getSelectedText(editor);
                    strictEqual(selections.length, expectedSelections.length);
                    selections.forEach((selection, i) => {
                        strictEqual(selection, expectedSelections[i]);
                    });
                });
            }
        );
    });

    describe('deleteString', () => {
        const command = 'deleteString';

        //todo: convert these to a foreach
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

        //todo: convert these to a foreach
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
    const startingCode = `{"key1": "value1"}`;

    describe('selectString', () => {
        const command = 'selectString';

        [
            {
                desc: 'should select key',
                cursorPosition: startingCode.indexOf('key1'),
                expectedSelections: ['key1'],
            },
            {
                desc: 'should select value',
                cursorPosition: startingCode.indexOf('value1'),
                expectedSelections: ['value1'],
            },
            {
                desc: 'should NOT select when cursor is not inside a string',
                cursorPosition: 0,
                expectedSelections: [''],
            },
            {
                desc: 'should select when multiple cursors are inside strings',
                cursorPosition: [
                    startingCode.indexOf('key1'),
                    startingCode.indexOf('value1'),
                ],
                expectedSelections: ['key1', 'value1'],
            },
        ].forEach(({ desc, cursorPosition, expectedSelections }) => {
            it(desc, async () => {
                const editor = await runCommandInEditor(
                    startingCode,
                    cursorPosition,
                    command,
                    language
                );
                const selections = getSelectedText(editor);
                strictEqual(selections.length, expectedSelections.length);
                selections.forEach((selection, i) => {
                    strictEqual(selection, expectedSelections[i]);
                });
            });
        });
    });

    describe('deleteString', () => {
        const command = 'deleteString';

        [
            {
                desc: 'should delete key',
                endingCode: `{"": "value1"}`,
                cursorPosition: startingCode.indexOf('key1'),
            },
            {
                desc: 'should delete value',
                endingCode: `{"key1": ""}`,
                cursorPosition: startingCode.indexOf('value1'),
            },
            {
                desc: 'should NOT delete when cursor is not inside a string',
                endingCode: `{"key1": "value1"}`,
                cursorPosition: 0,
            },
            {
                desc: 'should delete when multiple cursors are inside strings',
                endingCode: `{"": ""}`,
                cursorPosition: [
                    startingCode.indexOf('key1'),
                    startingCode.indexOf('value1'),
                ],
            },
        ].forEach(({ desc, endingCode, cursorPosition }) => {
            it(desc, async () => {
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
});
