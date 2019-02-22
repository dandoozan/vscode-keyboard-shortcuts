import { strictEqual } from 'assert';
import {
    workspace,
    window,
    commands,
    TextEditor,
    TextEditorEdit,
    Range,
    languages,
} from 'vscode';
import { executeCommand } from '../extension';
import { setCursor, getSelectedText, readFromClipboard } from '../utils';
import testCases from './testCases';
import { once } from 'lodash';

async function createEditor() {
    const doc = await workspace.openTextDocument();

    //show the editor so that it's the "activeTextEditor"
    const editor = await window.showTextDocument(doc);

    return editor;
}

const getEditor = once(async function getEditor() {
    return await createEditor();
});

async function setEditorText(editor: TextEditor, newText: string) {
    const oldTextRange = new Range(
        editor.document.positionAt(0),
        editor.document.positionAt(editor.document.getText().length)
    );
    await editor.edit((editBuilder: TextEditorEdit) => {
        editBuilder.replace(oldTextRange, newText);
    });
}

async function runCommandInEditor(
    language: string,
    type: string,
    action: string,
    testCase,
    editor: TextEditor
) {
    const { startingCode, cursorPosition } = testCase;

    await languages.setTextDocumentLanguage(editor.document, language);
    await setEditorText(editor, startingCode);
    await setCursor(editor, cursorPosition);

    // await commands.executeCommand(`vks.${commandName}`); // <- i tried this
    // but it seems it is not awaiting for some reason
    await executeCommand.call({ action, type }, editor);

    return editor;
}

const actionTests = {
    select: ({ expectedSelections }, editor) => {
        checkSelections(expectedSelections, editor);
    },
    delete: ({ endingCode }, editor) => {
        checkFileText(endingCode, editor);
    },
    replace: ({ endingCode }, editor) => {
        checkFileText(endingCode, editor);
    },
    cut: ({ expectedClipboardContent, endingCode }, editor) => {
        checkClipboardContent(expectedClipboardContent);
        checkFileText(endingCode, editor);
    },
    copy: ({ expectedClipboardContent, expectedSelections }, editor) => {
        checkClipboardContent(expectedClipboardContent);
        checkSelections(expectedSelections, editor);
    },
};

function checkSelections(expectedSelections, editor) {
    const selections = getSelectedText(editor);
    strictEqual(selections.length, expectedSelections.length);
    selections.forEach((selection, i) => {
        strictEqual(selection, expectedSelections[i]);
    });
}
function checkFileText(expectedFileText, editor) {
    strictEqual(editor.document.getText(), expectedFileText);
}
function checkClipboardContent(expectedClipboardContent) {
    strictEqual(readFromClipboard(), expectedClipboardContent);
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
                                const editor = await getEditor();
                                await runCommandInEditor(
                                    language,
                                    type,
                                    action,
                                    testCase,
                                    editor
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

