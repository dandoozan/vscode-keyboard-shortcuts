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
    action: string,
    type: string,
    language: string
) {
    const doc = await workspace.openTextDocument({
        content: startingCode,
        language,
    });

    //show the editor so that it's the "activeTextEditor"
    const editor = await window.showTextDocument(doc);
    await setCursor(editor, cursorPosition);
    // await commands.executeCommand(`vks.${commandName}`); // <- i tried this
    // but it seems it is not awaiting for some reason
    await executeCommand.call({ action, type }, editor);

    return editor;
}

describe('Select', () => {
    const action = 'select';

    const testCases = [
        //strings
        {
            desc: 'should select string',
            type: 'string',
            language: 'javascript',
            startingCode: `("Four score and seven years ago...")`,
            cursorPosition: 2, //<-- just inside the opening quote
            expectedSelections: [`Four score and seven years ago...`],
        },
        {
            desc: 'should select template string',
            type: 'string',
            language: 'javascript',
            startingCode: `(\`Four score and seven years ago...\`)`,
            cursorPosition: 2, //<-- just inside the opening quote
            expectedSelections: [`Four score and seven years ago...`],
        },
        {
            desc: 'should select directive',
            type: 'string',
            language: 'javascript',
            startingCode: `"Four score and seven years ago..."`,
            cursorPosition: 1, //<-- just inside the opening quote
            expectedSelections: [`Four score and seven years ago...`],
        },
        {
            desc: 'should NOT select when cursor is not inside a string',
            type: 'string',
            language: 'javascript',
            startingCode: `("Four score and seven years ago...")`,
            cursorPosition: 0,
            expectedSelections: [''],
        },
        {
            desc:
                'should select strings when multiple cursors are inside strings',
            type: 'string',
            language: 'javascript',
            startingCode: '("Four score" + "and seven years ago...")',
            cursorPosition: [2, 17],
            expectedSelections: ['Four score', 'and seven years ago...'],
        },

        //blocks
        {
            desc: 'should select inner block',
            type: 'block',
            language: 'javascript',
            startingCode: '({a:1})',
            cursorPosition: 2,
            expectedSelections: ['a:1'],
        },
        {
            desc: 'should select inner block when it is multiline',
            type: 'block',
            language: 'javascript',
            startingCode: '({\n' + '    a: 1,\n' + '    b: 2,\n' + '})',
            cursorPosition: 2,
            expectedSelections: ['    a: 1,\n' + '    b: 2,'],
        },
        {
            desc: 'should NOT select when cursor is not inside a block',
            type: 'block',
            language: 'javascript',
            startingCode: '({a:1})',
            cursorPosition: 0,
            expectedSelections: [''],
        },
    ];

    for (const testCase of testCases) {
        const {
            desc,
            type,
            language,
            startingCode,
            cursorPosition,
            expectedSelections,
        } = testCase;

        it(desc, async () => {
            const editor = await runCommandInEditor(
                startingCode,
                cursorPosition,
                action,
                type,
                language
            );
            const selections = getSelectedText(editor);
            strictEqual(selections.length, expectedSelections.length);
            selections.forEach((selection, i) => {
                strictEqual(selection, expectedSelections[i]);
            });
        });
    }
});

describe('Delete', () => {
    const action = 'delete';

    const testCases = [
        //strings
        {
            desc: 'should delete string',
            type: 'string',
            language: 'javascript',
            startingCode: `("Four score and seven years ago...")`,
            cursorPosition: 2, //<-- just inside the opening quote
            endingCode: '("")',
        },
        {
            desc: 'should delete template string',
            type: 'string',
            language: 'javascript',
            startingCode: `(\`Four score and seven years ago...\`)`,
            cursorPosition: 2, //<-- just inside the opening quote
            endingCode: '(``)',
        },
        {
            desc: 'should delete directive',
            type: 'string',
            language: 'javascript',
            startingCode: `"Four score and seven years ago..."`,
            cursorPosition: 1, //<-- just inside the opening quote
            endingCode: '""',
        },
        {
            desc: 'should NOT delete when cursor is not inside a string',
            type: 'string',
            language: 'javascript',
            startingCode: `("Four score and seven years ago...")`,
            cursorPosition: 0,
            endingCode: `("Four score and seven years ago...")`,
        },
        {
            desc:
                'should delete strings when multiple cursors are inside strings',
            type: 'string',
            language: 'javascript',
            startingCode: '("Four score" + "and seven years ago...")',
            cursorPosition: [2, 17],
            endingCode: '("" + "")',
        },

        //blocks
        {
            desc: 'should delete inner block',
            type: 'block',
            language: 'javascript',
            startingCode: '({a:1})',
            cursorPosition: 2, //<-- just inside the opening bracket
            endingCode: '({})',
        },
        {
            desc: 'should delete inner block when it is multiline',
            type: 'block',
            language: 'javascript',
            startingCode: '({\n' + '    a: 1,\n' + '    b: 2,\n' + '})',
            cursorPosition: 2,
            endingCode: '({})',
        },
        {
            desc: 'should NOT delete when cursor is not inside a block',
            type: 'block',
            language: 'javascript',
            startingCode: '({a:1})',
            cursorPosition: 0,
            endingCode: '({a:1})',
        },
    ];

    for (const testCase of testCases) {
        const {
            desc,
            type,
            language,
            startingCode,
            cursorPosition,
            endingCode,
        } = testCase;
        it(desc, async () => {
            const editor = await runCommandInEditor(
                startingCode,
                cursorPosition,
                action,
                type,
                language
            );
            strictEqual(editor.document.getText(), endingCode);
        });
    }
});

xdescribe('JavaScript', () => {
    const language = 'javascript';
    const stringContents = 'Four score and seven years ago...';

    describe('selectString', () => {
        const action = 'select';
        const type = 'string';

        const testCases = [
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
        ];

        for (const testCase of testCases) {
            const {
                desc,
                startingCode,
                cursorPosition,
                expectedSelections,
            } = testCase;

            it(desc, async () => {
                const editor = await runCommandInEditor(
                    startingCode,
                    cursorPosition,
                    action,
                    type,
                    language
                );
                const selections = getSelectedText(editor);
                strictEqual(selections.length, expectedSelections.length);
                selections.forEach((selection, i) => {
                    strictEqual(selection, expectedSelections[i]);
                });
            });
        }
    });

    describe('deleteString', () => {
        const action = 'delete';
        const type = 'string';

        const testCases = [
            {
                desc: 'should delete string',
                startingCode: `("${stringContents}")`,
                cursorPosition: 2, //<-- just inside the opening quote
                endingCode: '("")',
            },
            {
                desc: 'should delete template string',
                startingCode: `(\`${stringContents}\`)`,
                cursorPosition: 2, //<-- just inside the opening quote
                endingCode: '(``)',
            },
            {
                desc: 'should delete directive',
                startingCode: `"${stringContents}"`,
                cursorPosition: 1, //<-- just inside the opening quote
                endingCode: '""',
            },
            {
                desc: 'should NOT delete when cursor is not inside a string',
                startingCode: `("${stringContents}")`,
                cursorPosition: 0,
                endingCode: `("${stringContents}")`,
            },
            {
                desc:
                    'should delete strings when multiple cursors are inside strings',
                startingCode: '("Four score" + "and seven years ago...")',
                cursorPosition: [2, 17],
                endingCode: '("" + "")',
            },
        ];

        for (const testCase of testCases) {
            const { desc, startingCode, cursorPosition, endingCode } = testCase;
            it(desc, async () => {
                const editor = await runCommandInEditor(
                    startingCode,
                    cursorPosition,
                    action,
                    type,
                    language
                );
                strictEqual(editor.document.getText(), endingCode);
            });
        }
    });

    describe('replaceString', () => {
        const action = 'replace';
        const type = 'string';
        const clipboardContent = '87 years ago...';
        writeToClipboard(clipboardContent);

        const testCases = [
            {
                desc: 'should replace string',
                startingCode: `("${stringContents}")`,
                cursorPosition: 2, //<-- just inside the opening quote
                endingCode: `("${clipboardContent}")`,
            },
            {
                desc: 'should replace template string',
                startingCode: `(\`${stringContents}\`)`,
                cursorPosition: 2, //<-- just inside the opening quote
                endingCode: `(\`${clipboardContent}\`)`,
            },
            {
                desc: 'should replace directive',
                startingCode: `"${stringContents}"`,
                cursorPosition: 1, //<-- just inside the opening quote
                endingCode: `"${clipboardContent}"`,
            },
            {
                desc: 'should NOT replace when cursor is not inside a string',
                startingCode: `("${stringContents}")`,
                cursorPosition: 0,
                endingCode: `("${stringContents}")`,
            },
            {
                desc:
                    'should replace strings when multiple cursors are inside strings',
                startingCode: '("Four score" + "and seven years ago...")',
                cursorPosition: [2, 17],
                endingCode: `("${clipboardContent}" + "${clipboardContent}")`,
            },
        ];

        for (const testCase of testCases) {
            const { desc, startingCode, cursorPosition, endingCode } = testCase;
            it(desc, async () => {
                const editor = await runCommandInEditor(
                    startingCode,
                    cursorPosition,
                    action,
                    type,
                    language
                );
                strictEqual(editor.document.getText(), endingCode);
            });
        }
    });
});

xdescribe('JSON', () => {
    const language = 'json';

    describe('selectString', () => {
        const action = 'select';
        const type = 'string';

        const testCases = [
            {
                desc: 'should select key',
                startingCode: `{"key1": "value1"}`,
                cursorPosition: 2,
                expectedSelections: ['key1'],
            },
            {
                desc: 'should select value',
                startingCode: `{"key1": "value1"}`,
                cursorPosition: 10,
                expectedSelections: ['value1'],
            },
            {
                desc: 'should NOT select when cursor is not inside a string',
                startingCode: `{"key1": "value1"}`,
                cursorPosition: 0,
                expectedSelections: [''],
            },
            {
                desc: 'should select when multiple cursors are inside strings',
                startingCode: `{"key1": "value1"}`,
                cursorPosition: [2, 10],
                expectedSelections: ['key1', 'value1'],
            },
        ];

        for (const testCase of testCases) {
            const {
                desc,
                startingCode,
                cursorPosition,
                expectedSelections,
            } = testCase;
            it(desc, async () => {
                const editor = await runCommandInEditor(
                    startingCode,
                    cursorPosition,
                    action,
                    type,
                    language
                );
                const selections = getSelectedText(editor);
                strictEqual(selections.length, expectedSelections.length);
                selections.forEach((selection, i) => {
                    strictEqual(selection, expectedSelections[i]);
                });
            });
        }
    });

    describe('deleteString', () => {
        const action = 'delete';
        const type = 'string';

        const testCases = [
            {
                desc: 'should delete key',
                startingCode: `{"key1": "value1"}`,
                cursorPosition: 2,
                endingCode: `{"": "value1"}`,
            },
            {
                desc: 'should delete value',
                startingCode: `{"key1": "value1"}`,
                cursorPosition: 10,
                endingCode: `{"key1": ""}`,
            },
            {
                desc: 'should NOT delete when cursor is not inside a string',
                startingCode: `{"key1": "value1"}`,
                cursorPosition: 0,
                endingCode: `{"key1": "value1"}`,
            },
            {
                desc: 'should delete when multiple cursors are inside strings',
                startingCode: `{"key1": "value1"}`,
                cursorPosition: [2, 10],
                endingCode: `{"": ""}`,
            },
        ];

        for (const testCase of testCases) {
            const { desc, startingCode, cursorPosition, endingCode } = testCase;
            it(desc, async () => {
                const editor = await runCommandInEditor(
                    startingCode,
                    cursorPosition,
                    action,
                    type,
                    language
                );
                strictEqual(editor.document.getText(), endingCode);
            });
        }
    });
});
