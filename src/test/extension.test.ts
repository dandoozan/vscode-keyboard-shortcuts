import { equal } from 'assert';
import { workspace, window } from 'vscode';
import { deleteInnerString } from '../extension';
import { setCursor } from '../utils';

describe('deleteInnerString', () => {
    //tests i should make:
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
    //  -multicursor

    describe('Double-quote string', () => {
        it('should delete double-quote string', async () => {
            const startingCode = '("Four score and seven years ago...")';
            const expectedEndingCode = '("")';
            const cursorPosition = 2; //just after the "

            const doc = await workspace.openTextDocument({
                content: startingCode,
                language: 'javascript',
            });

            //show it so that it's the "activeTextEditor"
            const editor = await window.showTextDocument(doc);
            await setCursor(editor, cursorPosition);

            await deleteInnerString();
            equal(doc.getText(), expectedEndingCode);
        });
    });
});
