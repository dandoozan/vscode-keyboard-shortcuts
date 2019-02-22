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
                        startingCode: `("String contents")`,
                        cursorPosition: 2,
                        expectedSelections: [`String contents`],
                    },
                    {
                        desc: 'should select template string',
                        startingCode: `(\`Template string contents\`)`,
                        cursorPosition: 2,
                        expectedSelections: [`Template string contents`],
                    },
                    {
                        desc: 'should select directive',
                        startingCode: `"use strict"`,
                        cursorPosition: 1,
                        expectedSelections: [`use strict`],
                    },
                    {
                        desc:
                            'should NOT select when cursor is not inside a string',
                        startingCode: `("String contents")`,
                        cursorPosition: 0,
                        expectedSelections: [''],
                    },
                    {
                        desc:
                            'should select strings when multiple cursors are inside strings',
                        startingCode: '("String1" + "String2")',
                        cursorPosition: [2, 17],
                        expectedSelections: ['String1', 'String2'],
                    },
                ],
            },
            delete: {
                testCases: [
                    {
                        desc: 'should delete string',
                        startingCode: `("String contents")`,
                        cursorPosition: 2,
                        endingCode: '("")',
                    },
                    {
                        desc: 'should delete template string',
                        startingCode: `(\`Template string contents\`)`,
                        cursorPosition: 2,
                        endingCode: '(``)',
                    },
                    {
                        desc: 'should delete directive',
                        startingCode: `"use strict"`,
                        cursorPosition: 1,
                        endingCode: '""',
                    },
                    {
                        desc:
                            'should NOT delete when cursor is not inside a string',
                        startingCode: `("String contents")`,
                        cursorPosition: 0,
                        endingCode: `("String contents")`,
                    },
                    {
                        desc:
                            'should delete strings when multiple cursors are inside strings',
                        startingCode: '("String1" + "String2")',
                        cursorPosition: [2, 17],
                        endingCode: '("" + "")',
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
                        startingCode: `("String contents")`,
                        cursorPosition: 2,
                        endingCode: `("")`,
                        expectedClipboardContent: `String contents`,
                    },
                    {
                        desc: 'should cut template string',
                        startingCode: `(\`Template string\`)`,
                        cursorPosition: 2,
                        endingCode: `(\`\`)`,
                        expectedClipboardContent: `Template string`,
                    },
                    {
                        desc: 'should cut directive',
                        startingCode: `"use strict"`,
                        cursorPosition: 1,
                        endingCode: `""`,
                        expectedClipboardContent: `use strict`,
                    },
                    {
                        desc:
                            'should NOT cut when cursor is not inside a string',
                        startingCode: `("String contents")`,
                        cursorPosition: 0,
                        endingCode: `("String contents")`,
                        expectedClipboardContent: `PreviousClipboardContent`,
                    },
                    {
                        desc:
                            'should cut strings when multiple cursors are inside strings',
                        startingCode: '("String1" + "String2")',
                        cursorPosition: [2, 17],
                        endingCode: `("" + "")`,
                        expectedClipboardContent: `String1\nString2`,
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
                        startingCode: `("String contents")`,
                        cursorPosition: 2,
                        expectedSelections: [`String contents`],
                        expectedClipboardContent: `String contents`,
                    },
                    {
                        desc: 'should copy template string',
                        startingCode: `(\`Template string\`)`,
                        cursorPosition: 2,
                        expectedSelections: [`Template string`],
                        expectedClipboardContent: `Template string`,
                    },
                    {
                        desc: 'should copy directive',
                        startingCode: `"use strict"`,
                        cursorPosition: 1,
                        expectedSelections: [`use strict`],
                        expectedClipboardContent: `use strict`,
                    },
                    {
                        desc:
                            'should NOT copy when cursor is not inside a string',
                        startingCode: `("String contents")`,
                        cursorPosition: 0,
                        expectedSelections: [``],
                        expectedClipboardContent: `PreviousClipboardContent`,
                    },
                    {
                        desc:
                            'should copy strings when multiple cursors are inside strings',
                        startingCode: '("String1" + "String2")',
                        cursorPosition: [2, 17],
                        expectedSelections: [`String1`, `String2`],
                        expectedClipboardContent: `String1\nString2`,
                    },
                ],
            },
            replace: {
                beforeEach: () => {
                    writeToClipboard('ClipboardContent');
                },
                testCases: [
                    {
                        desc: 'should replace string',
                        startingCode: `("String contents")`,
                        cursorPosition: 2,
                        endingCode: `("ClipboardContent")`,
                    },
                    {
                        desc: 'should replace template string',
                        startingCode: `(\`Template string\`)`,
                        cursorPosition: 2,
                        endingCode: `(\`ClipboardContent\`)`,
                    },
                    {
                        desc: 'should replace directive',
                        startingCode: `"use strict"`,
                        cursorPosition: 1,
                        endingCode: `"ClipboardContent"`,
                    },
                    {
                        desc:
                            'should NOT replace when cursor is not inside a string',
                        startingCode: `("String contents")`,
                        cursorPosition: 0,
                        endingCode: `("String contents")`,
                    },
                    {
                        desc:
                            'should replace strings when multiple cursors are inside strings',
                        startingCode: '("String1" + "String2")',
                        cursorPosition: [2, 17],
                        endingCode: `("ClipboardContent" + "ClipboardContent")`,
                    },
                ],
            },
        },
        inner_block: {
            select: {
                testCases: [
                    {
                        desc: 'should select inner block',
                        startingCode: '({a:1})',
                        cursorPosition: 2,
                        expectedSelections: ['a:1'],
                    },
                    {
                        desc: 'should select inner block when it is multiline',
                        startingCode: '({\n    a: 1,\n    b: 2,\n})',
                        cursorPosition: 2,
                        expectedSelections: ['    a: 1,\n    b: 2,'],
                    },
                    {
                        desc:
                            'should NOT select when cursor is not inside a block',
                        startingCode: '({a:1})',
                        cursorPosition: 0,
                        expectedSelections: [''],
                    },
                    {
                        desc:
                            'should select inner blocks when multiple cursors are inside inner blocks',
                        startingCode: '({a:1})\n({b:2})',
                        cursorPosition: [2, 10],
                        expectedSelections: ['a:1', 'b:2'],
                    },
                ],
            },
            copy: {
                beforeEach: () => {
                    writeToClipboard('PreviousClipboardContent');
                },
                testCases: [
                    {
                        desc: 'should copy inner block',
                        startingCode: '({a:1})',
                        cursorPosition: 2,
                        expectedSelections: ['a:1'],
                        expectedClipboardContent: 'a:1',
                    },
                    {
                        desc: 'should copy inner block when it is multiline',
                        startingCode: '({\n    a: 1,\n    b: 2,\n})',
                        cursorPosition: 2,
                        expectedSelections: ['    a: 1,\n    b: 2,'],
                        expectedClipboardContent: '    a: 1,\n    b: 2,',
                    },
                    {
                        desc:
                            'should NOT copy when cursor is not inside a block',
                        startingCode: '({a:1})',
                        cursorPosition: 0,
                        expectedSelections: [''],
                        expectedClipboardContent: 'PreviousClipboardContent',
                    },
                    {
                        desc:
                            'should copy inner blocks when multiple cursors are inside inner blocks',
                        startingCode: '({a:1})\n({b:2})',
                        cursorPosition: [2, 10],
                        expectedSelections: [`a:1`, `b:2`],
                        expectedClipboardContent: `a:1\nb:2`,
                    },
                ],
            },
        },
        parameter: {
            select: {
                testCases: [
                    {
                        desc: 'should select parameter',
                        startingCode: `((param1) => {})`,
                        cursorPosition: 2,
                        expectedSelections: [`param1`],
                    },
                    {
                        desc:
                            'should NOT select when cursor is not inside a paramater',
                        startingCode: `((param1) => {})`,
                        cursorPosition: 0,
                        expectedSelections: [''],
                    },
                    {
                        desc:
                            'should select parameters when multiple cursors are inside parameters',
                        startingCode: '((param1, param2) => {})',
                        cursorPosition: [2, 10],
                        expectedSelections: ['param1', 'param2'],
                    },
                ],
            },
            delete: {
                testCases: [
                    {
                        desc: 'should delete parameter',
                        startingCode: '((param1) => {})',
                        cursorPosition: 2,
                        endingCode: '(() => {})',
                    },
                    {
                        desc:
                            'should NOT delete when cursor is not inside a parameter',
                        startingCode: '((param1) => {})',
                        cursorPosition: 0,
                        endingCode: '((param1) => {})',
                    },
                    {
                        desc:
                            'should delete parameters when multiple cursors are inside parameters',
                        startingCode: '((param1, param2) => {})',
                        cursorPosition: [2, 10],
                        endingCode: '((, ) => {})',
                    },
                ],
            },
            cut: {
                beforeEach: () => {
                    writeToClipboard('PreviousClipboardContent');
                },
                testCases: [
                    {
                        desc: 'should cut parameter',
                        startingCode: `((param1) => {})`,
                        cursorPosition: 2,
                        endingCode: `(() => {})`,
                        expectedClipboardContent: `param1`,
                    },
                    {
                        desc:
                            'should NOT cut when cursor is not inside a parameter',
                        startingCode: `((param1) => {})`,
                        cursorPosition: 0,
                        endingCode: `((param1) => {})`,
                        expectedClipboardContent: `PreviousClipboardContent`,
                    },
                    {
                        desc:
                            'should cut parameters when multiple cursors are inside parameters',
                        startingCode: '((param1, param2) => {})',
                        cursorPosition: [2, 10],
                        endingCode: `((, ) => {})`,
                        expectedClipboardContent: `param1\nparam2`,
                    },
                ],
            },
            copy: {
                beforeEach: () => {
                    writeToClipboard('PreviousClipboardContent');
                },
                testCases: [
                    {
                        desc: 'should copy parameter',
                        startingCode: `((param1) => {})`,
                        cursorPosition: 2,
                        expectedSelections: [`param1`],
                        expectedClipboardContent: `param1`,
                    },
                    {
                        desc:
                            'should NOT copy when cursor is not inside a parameter',
                        startingCode: `((param1) => {})`,
                        cursorPosition: 0,
                        expectedSelections: [``],
                        expectedClipboardContent: `PreviousClipboardContent`,
                    },
                    {
                        desc:
                            'should copy parameters when multiple cursors are inside parameters',
                        startingCode: '((param1, param2) => {})',
                        cursorPosition: [2, 10],
                        expectedSelections: [`param1`, `param2`],
                        expectedClipboardContent: `param1\nparam2`,
                    },
                ],
            },
            replace: {
                beforeEach: () => {
                    writeToClipboard('ClipboardContent');
                },
                testCases: [
                    {
                        desc: 'should replace parameter',
                        startingCode: `((param1) => {})`,
                        cursorPosition: 2,
                        endingCode: `((ClipboardContent) => {})`,
                    },
                    {
                        desc:
                            'should NOT replace when cursor is not inside a parameter',
                        startingCode: `((param1) => {})`,
                        cursorPosition: 0,
                        endingCode: `((param1) => {})`,
                    },
                    {
                        desc:
                            'should replace parameters when multiple cursors are inside parameters',
                        startingCode: '((param1, param2) => {})',
                        cursorPosition: [2, 10],
                        endingCode: `((ClipboardContent, ClipboardContent) => {})`,
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
