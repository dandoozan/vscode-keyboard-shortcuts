import { strictEqual } from 'assert';
import { workspace, window, commands } from 'vscode';
import { executeCommand } from '../extension';
import { setCursor, getSelectedText } from '../utils';
import testCases from './testCases';

async function runCommandInEditor(language, type, action, testCase) {
    const { startingCode, cursorPosition } = testCase;

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

const actionTests = {
    select: testSelect,
    delete: testDelete,
    replace: testReplace,
};

function testSelect(testCase, editor) {
    const { expectedSelections } = testCase;
    const selections = getSelectedText(editor);
    strictEqual(selections.length, expectedSelections.length);
    selections.forEach((selection, i) => {
        strictEqual(selection, expectedSelections[i]);
    });
}

function testDelete(testCase, editor) {
    const { endingCode } = testCase;
    strictEqual(editor.document.getText(), endingCode);
}
function testReplace(testCase, editor) {
    const { endingCode } = testCase;
    strictEqual(editor.document.getText(), endingCode);
}

for (const language in testCases) {
    describe(language, () => {
        for (const type in testCases[language]) {
            describe(type, () => {
                for (const action in testCases[language][type]) {
                    describe(action, () => {
                        const obj = testCases[language][type][action];
                        if (obj.beforeEach) {
                            beforeEach(obj.beforeEach);
                        }
                        for (const testCase of obj.testCases) {
                            it(testCase.desc, async () => {
                                const editor = await runCommandInEditor(
                                    language,
                                    type,
                                    action,
                                    testCase
                                );
                                actionTests[action](testCase, editor);
                            });
                        }
                    });
                }
            });
        }
    });
}
