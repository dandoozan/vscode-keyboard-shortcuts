import { writeToClipboard } from '../utils';

//tests:
//-javascript
//  -string commands
//      -select
//          -'regular string'
//          -`template string`
//          -'directive' (ie. 'use strict')
//          -other
//              -cursor not inside a string
//              -multi cursor
//      -delete
//          ...
//      ...
//  -parameter commands
//      -select
//          -parameter
//      ...
//  ...
//-jsx (javascriptreact) (just do a few basic tests because the main tests should be in Babel)
//  -string
//      -select
//          -paramater (eg. <div className="my-class"></div>)
//-typescript (just do a few basic tests because the main tests should be in Babel)
//  -string
//      -select
//          -typed string (eg. let str: string = 'regular string')
//-tsx (typescriptreact) (just do a few basic tests because the main tests should be in Babel)
//  -string
//      -select
//          -parameter (eg. <div className="my-class"></div>)
//-json
//  -string
//      -select
//          -"key"
//          -"value"
//          -other
//              -cursor not inside a string
//              -multi cursor
//      -delete
//          ...
//      ...

export default {
    javascript: {
        string: {
            select: {
                testCases: [
                    {
                        desc: 'should select string',
                        startingCode: '("String contents")',
                        cursorPosition: 2,
                        expectedSelections: ['String contents'],
                    },
                    {
                        desc: 'should select template string',
                        startingCode: '(`Template string contents`)',
                        cursorPosition: 2,
                        expectedSelections: ['Template string contents'],
                    },
                    {
                        desc: 'should select directive',
                        startingCode: '"use strict"',
                        cursorPosition: 1,
                        expectedSelections: ['use strict'],
                    },
                    {
                        desc:
                            'should NOT select when cursor is not inside a string',
                        startingCode: '("String contents")',
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
                        startingCode: '("String contents")',
                        cursorPosition: 2,
                        endingCode: '("")',
                    },
                    {
                        desc: 'should delete template string',
                        startingCode: '(`Template string contents`)',
                        cursorPosition: 2,
                        endingCode: '(``)',
                    },
                    {
                        desc: 'should delete directive',
                        startingCode: '"use strict"',
                        cursorPosition: 1,
                        endingCode: '""',
                    },
                    {
                        desc:
                            'should NOT delete when cursor is not inside a string',
                        startingCode: '("String contents")',
                        cursorPosition: 0,
                        endingCode: '("String contents")',
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
                        startingCode: '("String contents")',
                        cursorPosition: 2,
                        endingCode: '("")',
                        expectedClipboardContent: 'String contents',
                    },
                    {
                        desc: 'should cut template string',
                        startingCode: '(`Template string`)',
                        cursorPosition: 2,
                        endingCode: '(``)',
                        expectedClipboardContent: 'Template string',
                    },
                    {
                        desc: 'should cut directive',
                        startingCode: '"use strict"',
                        cursorPosition: 1,
                        endingCode: '""',
                        expectedClipboardContent: 'use strict',
                    },
                    {
                        desc:
                            'should NOT cut when cursor is not inside a string',
                        startingCode: '("String contents")',
                        cursorPosition: 0,
                        endingCode: '("String contents")',
                        expectedClipboardContent: 'PreviousClipboardContent',
                    },
                    {
                        desc:
                            'should cut strings when multiple cursors are inside strings',
                        startingCode: '("String1" + "String2")',
                        cursorPosition: [2, 17],
                        endingCode: '("" + "")',
                        expectedClipboardContent: 'String1\nString2',
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
                        startingCode: '("String contents")',
                        cursorPosition: 2,
                        expectedSelections: ['String contents'],
                        expectedClipboardContent: 'String contents',
                    },
                    {
                        desc: 'should copy template string',
                        startingCode: '(`Template string`)',
                        cursorPosition: 2,
                        expectedSelections: ['Template string'],
                        expectedClipboardContent: 'Template string',
                    },
                    {
                        desc: 'should copy directive',
                        startingCode: '"use strict"',
                        cursorPosition: 1,
                        expectedSelections: ['use strict'],
                        expectedClipboardContent: 'use strict',
                    },
                    {
                        desc:
                            'should NOT copy when cursor is not inside a string',
                        startingCode: '("String contents")',
                        cursorPosition: 0,
                        expectedSelections: [''],
                        expectedClipboardContent: 'PreviousClipboardContent',
                    },
                    {
                        desc:
                            'should copy strings when multiple cursors are inside strings',
                        startingCode: '("String1" + "String2")',
                        cursorPosition: [2, 17],
                        expectedSelections: ['String1', 'String2'],
                        expectedClipboardContent: 'String1\nString2',
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
                        startingCode: '("String contents")',
                        cursorPosition: 2,
                        endingCode: '("ClipboardContent")',
                    },
                    {
                        desc: 'should replace template string',
                        startingCode: '(`Template string`)',
                        cursorPosition: 2,
                        endingCode: '(`ClipboardContent`)',
                    },
                    {
                        desc: 'should replace directive',
                        startingCode: '"use strict"',
                        cursorPosition: 1,
                        endingCode: '"ClipboardContent"',
                    },
                    {
                        desc:
                            'should NOT replace when cursor is not inside a string',
                        startingCode: '("String contents")',
                        cursorPosition: 0,
                        endingCode: '("String contents")',
                    },
                    {
                        desc:
                            'should replace strings when multiple cursors are inside strings',
                        startingCode: '("String1" + "String2")',
                        cursorPosition: [2, 17],
                        endingCode: '("ClipboardContent" + "ClipboardContent")',
                    },
                ],
            },
        },
        block: {
            select: {
                testCases: [
                    {
                        desc: 'should select object expression',
                        startingCode: '({})',
                        cursorPosition: 0,
                        expectedSelections: ['({})'],
                    },
                    {
                        desc: 'should select object property',
                        startingCode: '({a:{}})',
                        cursorPosition: 2,
                        expectedSelections: ['a:{}'],
                    },
                    {
                        desc: 'should select array property',
                        startingCode: '({a:[]})',
                        cursorPosition: 2,
                        expectedSelections: ['a:[]'],
                    },
                    {
                        desc: 'should select function declaration',
                        startingCode: 'function foo(){}',
                        cursorPosition: 0,
                        expectedSelections: ['function foo(){}'],
                    },
                    {
                        desc: 'should select function expression',
                        startingCode: 'var fn = function(){}',
                        cursorPosition: 0,
                        expectedSelections: ['var fn = function(){}'],
                    },
                    {
                        desc: 'should select arrow function expression',
                        startingCode: 'var fn = ()=>{}',
                        cursorPosition: 0,
                        expectedSelections: ['var fn = ()=>{}'],
                    },
                    {
                        desc: 'should select iife',
                        startingCode: '(function(){})()',
                        cursorPosition: 0,
                        expectedSelections: ['(function(){})()'],
                    },
                    {
                        desc: 'should select arrow function iife',
                        startingCode: '(()=>{})()',
                        cursorPosition: 0,
                        expectedSelections: ['(()=>{})()'],
                    },
                    {
                        desc: 'should select for loop',
                        startingCode: 'for(let i=0;i<1;i++){}',
                        cursorPosition: 0,
                        expectedSelections: ['for(let i=0;i<1;i++){}'],
                    },
                    {
                        desc: 'should select while loop',
                        startingCode: 'while(true){}',
                        cursorPosition: 0,
                        expectedSelections: ['while(true){}'],
                    },
                    {
                        desc: 'should select if statement',
                        startingCode: 'if(true){}',
                        cursorPosition: 0,
                        expectedSelections: ['if(true){}'],
                    },
                    {
                        desc: 'should select variable that is an object',
                        startingCode: 'var obj={}',
                        cursorPosition: 0,
                        expectedSelections: ['var obj={}'],
                    },
                    {
                        desc: 'should select variable that is an array',
                        startingCode: 'var obj=[]',
                        cursorPosition: 0,
                        expectedSelections: ['var obj=[]'],
                    },
                    {
                        desc: 'should select array item that is an object',
                        startingCode: '([{}])',
                        cursorPosition: 2,
                        expectedSelections: ['{}'],
                    },
                    {
                        desc: 'should select array item that is an array',
                        startingCode: '([[]])',
                        cursorPosition: 2,
                        expectedSelections: ['[]'],
                    },
                    {
                        desc: 'should select array item that is a function',
                        startingCode: '([function(){}])',
                        cursorPosition: 2,
                        expectedSelections: ['function(){}'],
                    },
                    {
                        desc:
                            'should select array item that is an arrow function',
                        startingCode: '([()=>{}])',
                        cursorPosition: 2,
                        expectedSelections: ['()=>{}'],
                    },
                    {
                        desc:
                            'should NOT select when cursor is not inside a block',
                        startingCode: '({})',
                        cursorPosition: 4,
                        expectedSelections: [''],
                    },
                    {
                        desc:
                            'should select blocks when multiple cursors are inside blocks',
                        startingCode: '({a:1});\n({b:2});',
                        cursorPosition: [0, 9],
                        expectedSelections: ['({a:1});', '({b:2});'],
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
                        expectedSelections: ['a:1', 'b:2'],
                        expectedClipboardContent: 'a:1\nb:2',
                    },
                ],
            },
        },
        item: {
            select: {
                testCases: [
                    {
                        desc: 'should select item',
                        startingCode: '(["item1"])',
                        cursorPosition: 2,
                        expectedSelections: ['"item1"'],
                    },
                    {
                        desc: 'should select parameter',
                        startingCode: '((param1)=>{})',
                        cursorPosition: 2,
                        expectedSelections: ['param1'],
                    },
                    {
                        desc: 'should select argument',
                        startingCode: '(()=>{})("arg1")',
                        cursorPosition: 10,
                        expectedSelections: ['"arg1"'],
                    },
                    {
                        desc:
                            'should NOT select when cursor is not inside an item',
                        startingCode: '(["item1"])',
                        cursorPosition: 0,
                        expectedSelections: [''],
                    },
                    {
                        desc:
                            'should select items when multiple cursors are inside items',
                        startingCode: '(["item1", "item2"])',
                        cursorPosition: [2, 11],
                        expectedSelections: ['"item1"', '"item2"'],
                    },
                ],
            },
            delete: {
                testCases: [
                    {
                        desc: 'should delete item',
                        startingCode: '(["item1"])',
                        cursorPosition: 2,
                        endingCode: '([])',
                    },
                ],
            },
            cut: {
                beforeEach: () => {
                    writeToClipboard('PreviousClipboardContent');
                },
                testCases: [
                    {
                        desc: 'should cut item',
                        startingCode: '(["item1"])',
                        cursorPosition: 2,
                        endingCode: '([])',
                        expectedClipboardContent: '"item1"',
                    },
                ],
            },
            copy: {
                beforeEach: () => {
                    writeToClipboard('PreviousClipboardContent');
                },
                testCases: [
                    {
                        desc: 'should copy item',
                        startingCode: '(["item1"])',
                        cursorPosition: 2,
                        expectedSelections: ['"item1"'],
                        expectedClipboardContent: '"item1"',
                    },
                ],
            },
            replace: {
                beforeEach: () => {
                    writeToClipboard('ClipboardContent');
                },
                testCases: [
                    {
                        desc: 'should replace item',
                        startingCode: '(["item1"])',
                        cursorPosition: 2,
                        endingCode: '([ClipboardContent])',
                    },
                ],
            },
        },
    },
    javascriptreact: {
        string: {
            select: {
                testCases: [
                    {
                        desc: 'should select string',
                        startingCode: '<div className="my-class"></div>',
                        cursorPosition: 16,
                        expectedSelections: ['my-class'],
                    },
                ],
            },
        },
    },
    typescript: {
        string: {
            select: {
                testCases: [
                    {
                        desc: 'should select string',
                        startingCode: 'let a: string = "String contents";',
                        cursorPosition: 16,
                        expectedSelections: ['String contents'],
                    },
                ],
            },
        },
    },
    typescriptreact: {
        string: {
            select: {
                testCases: [
                    {
                        desc: 'should select string',
                        startingCode: '<div className="my-class"></div>',
                        cursorPosition: 16,
                        expectedSelections: ['my-class'],
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
                        startingCode: '{"key1": "value1"}',
                        cursorPosition: 2,
                        expectedSelections: ['key1'],
                    },
                    {
                        desc: 'should select value',
                        startingCode: '{"key1": "value1"}',
                        cursorPosition: 10,
                        expectedSelections: ['value1'],
                    },
                    {
                        desc:
                            'should NOT select when cursor is not inside a string',
                        startingCode: '{"key1": "value1"}',
                        cursorPosition: 0,
                        expectedSelections: [''],
                    },
                    {
                        desc:
                            'should select when multiple cursors are inside strings',
                        startingCode: '{"key1": "value1"}',
                        cursorPosition: [2, 10],
                        expectedSelections: ['key1', 'value1'],
                    },
                ],
            },
            delete: {
                testCases: [
                    {
                        desc: 'should delete key',
                        startingCode: '{"key1": "value1"}',
                        cursorPosition: 2,
                        endingCode: '{"": "value1"}',
                    },
                    {
                        desc: 'should delete value',
                        startingCode: '{"key1": "value1"}',
                        cursorPosition: 10,
                        endingCode: '{"key1": ""}',
                    },
                    {
                        desc:
                            'should NOT delete when cursor is not inside a string',
                        startingCode: '{"key1": "value1"}',
                        cursorPosition: 0,
                        endingCode: '{"key1": "value1"}',
                    },
                    {
                        desc:
                            'should delete when multiple cursors are inside strings',
                        startingCode: '{"key1": "value1"}',
                        cursorPosition: [2, 10],
                        endingCode: '{"": ""}',
                    },
                ],
            },
        },
    },
};
