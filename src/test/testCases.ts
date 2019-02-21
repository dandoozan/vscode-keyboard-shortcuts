import { writeToClipboard } from '../utils';

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

export default {
    javascript: {
        string: {
            select: {
                testCases: [
                    {
                        desc: 'should select string',
                        startingCode: `("Four score and seven years ago...")`,
                        cursorPosition: 2, //<-- just inside the opening quote
                        expectedSelections: [
                            `Four score and seven years ago...`,
                        ],
                    },
                    {
                        desc: 'should select template string',
                        startingCode: `(\`Four score and seven years ago...\`)`,
                        cursorPosition: 2, //<-- just inside the opening quote
                        expectedSelections: [
                            `Four score and seven years ago...`,
                        ],
                    },
                    {
                        desc: 'should select directive',
                        startingCode: `"Four score and seven years ago..."`,
                        cursorPosition: 1, //<-- just inside the opening quote
                        expectedSelections: [
                            `Four score and seven years ago...`,
                        ],
                    },
                    {
                        desc:
                            'should NOT select when cursor is not inside a string',
                        startingCode: `("Four score and seven years ago...")`,
                        cursorPosition: 0,
                        expectedSelections: [''],
                    },
                    {
                        desc:
                            'should select strings when multiple cursors are inside strings',
                        startingCode:
                            '("Four score" + "and seven years ago...")',
                        cursorPosition: [2, 17],
                        expectedSelections: [
                            'Four score',
                            'and seven years ago...',
                        ],
                    },
                ],
            },
            delete: {
                testCases: [
                    {
                        desc: 'should delete string',
                        startingCode: `("Four score and seven years ago...")`,
                        cursorPosition: 2, //<-- just inside the opening quote
                        endingCode: '("")',
                    },
                    {
                        desc: 'should delete template string',
                        startingCode: `(\`Four score and seven years ago...\`)`,
                        cursorPosition: 2, //<-- just inside the opening quote
                        endingCode: '(``)',
                    },
                    {
                        desc: 'should delete directive',
                        startingCode: `"Four score and seven years ago..."`,
                        cursorPosition: 1, //<-- just inside the opening quote
                        endingCode: '""',
                    },
                    {
                        desc:
                            'should NOT delete when cursor is not inside a string',
                        startingCode: `("Four score and seven years ago...")`,
                        cursorPosition: 0,
                        endingCode: `("Four score and seven years ago...")`,
                    },
                    {
                        desc:
                            'should delete strings when multiple cursors are inside strings',
                        startingCode:
                            '("Four score" + "and seven years ago...")',
                        cursorPosition: [2, 17],
                        endingCode: '("" + "")',
                    },
                ],
            },
            replace: {
                beforeEach: () => {
                    writeToClipboard('clipboardContent');
                },
                testCases: [
                    {
                        desc: 'should replace string',
                        startingCode: `("Four score and seven years ago...")`,
                        cursorPosition: 2, //<-- just inside the opening quote
                        endingCode: `("clipboardContent")`,
                    },
                    {
                        desc: 'should replace template string',
                        startingCode: `(\`Four score and seven years ago...\`)`,
                        cursorPosition: 2, //<-- just inside the opening quote
                        endingCode: `(\`clipboardContent\`)`,
                    },
                    {
                        desc: 'should replace directive',
                        startingCode: `"Four score and seven years ago..."`,
                        cursorPosition: 1, //<-- just inside the opening quote
                        endingCode: `"clipboardContent"`,
                    },
                    {
                        desc:
                            'should NOT replace when cursor is not inside a string',
                        startingCode: `("Four score and seven years ago...")`,
                        cursorPosition: 0,
                        endingCode: `("Four score and seven years ago...")`,
                    },
                    {
                        desc:
                            'should replace strings when multiple cursors are inside strings',
                        startingCode:
                            '("Four score" + "and seven years ago...")',
                        cursorPosition: [2, 17],
                        endingCode: `("clipboardContent" + "clipboardContent")`,
                    },
                ],
            },
            cut: {
                beforeEach: () => {
                    writeToClipboard('PreviousClipboardContent');
                },
                testCases: [
                    {
                        desc: 'should cut string',
                        startingCode: `("Four score and seven years ago...")`,
                        cursorPosition: 2, //<-- just inside the opening quote
                        endingCode: `("")`,
                        expectedClipboardContent: `Four score and seven years ago...`,
                    },
                    {
                        desc: 'should cut template string',
                        startingCode: `(\`Four score and seven years ago...\`)`,
                        cursorPosition: 2, //<-- just inside the opening quote
                        endingCode: `(\`\`)`,
                        expectedClipboardContent: `Four score and seven years ago...`,
                    },
                    {
                        desc: 'should cut directive',
                        startingCode: `"Four score and seven years ago..."`,
                        cursorPosition: 1, //<-- just inside the opening quote
                        endingCode: `""`,
                        expectedClipboardContent: `Four score and seven years ago...`,
                    },
                    {
                        desc:
                            'should NOT cut when cursor is not inside a string',
                        startingCode: `("Four score and seven years ago...")`,
                        cursorPosition: 0,
                        endingCode: `("Four score and seven years ago...")`,
                        expectedClipboardContent: `PreviousClipboardContent`,
                    },
                    {
                        desc:
                            'should cut strings when multiple cursors are inside strings',
                        startingCode:
                            '("Four score" + "and seven years ago...")',
                        cursorPosition: [2, 17],
                        endingCode: `("" + "")`,
                        expectedClipboardContent: `Four score\nand seven years ago...`,
                    },
                ],
            },
            copy: {
                beforeEach: () => {
                    writeToClipboard('PreviousClipboardContent');
                },
                testCases: [
                    {
                        desc: 'should copy string',
                        startingCode: `("Four score and seven years ago...")`,
                        cursorPosition: 2, //<-- just inside the opening quote
                        expectedSelections: [`Four score and seven years ago...`],
                        expectedClipboardContent: `Four score and seven years ago...`,
                    },
                    {
                        desc: 'should copy template string',
                        startingCode: `(\`Four score and seven years ago...\`)`,
                        cursorPosition: 2, //<-- just inside the opening quote
                        expectedSelections: [`Four score and seven years ago...`],
                        expectedClipboardContent: `Four score and seven years ago...`,
                    },
                    {
                        desc: 'should copy directive',
                        startingCode: `"Four score and seven years ago..."`,
                        cursorPosition: 1, //<-- just inside the opening quote
                        expectedSelections: [`Four score and seven years ago...`],
                        expectedClipboardContent: `Four score and seven years ago...`,
                    },
                    {
                        desc:
                            'should NOT copy when cursor is not inside a string',
                        startingCode: `("Four score and seven years ago...")`,
                        cursorPosition: 0,
                        expectedSelections: [``],
                        expectedClipboardContent: `PreviousClipboardContent`,
                    },
                    {
                        desc:
                            'should copy strings when multiple cursors are inside strings',
                        startingCode:
                            '("Four score" + "and seven years ago...")',
                        cursorPosition: [2, 17],
                        expectedSelections: [`Four score`, `and seven years ago...`],
                        expectedClipboardContent: `Four score\nand seven years ago...`,
                    },
                ],
            },
        },
    },
    json: {
        string: {
            select: {
                testCases: [
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
                        desc:
                            'should NOT select when cursor is not inside a string',
                        startingCode: `{"key1": "value1"}`,
                        cursorPosition: 0,
                        expectedSelections: [''],
                    },
                    {
                        desc:
                            'should select when multiple cursors are inside strings',
                        startingCode: `{"key1": "value1"}`,
                        cursorPosition: [2, 10],
                        expectedSelections: ['key1', 'value1'],
                    },
                ],
            },
            delete: {
                testCases: [
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
                        desc:
                            'should NOT delete when cursor is not inside a string',
                        startingCode: `{"key1": "value1"}`,
                        cursorPosition: 0,
                        endingCode: `{"key1": "value1"}`,
                    },
                    {
                        desc:
                            'should delete when multiple cursors are inside strings',
                        startingCode: `{"key1": "value1"}`,
                        cursorPosition: [2, 10],
                        endingCode: `{"": ""}`,
                    },
                ],
            },
        },
    },
};
