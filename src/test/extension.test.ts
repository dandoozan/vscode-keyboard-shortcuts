import { strictEqual } from 'assert';
import { executeCommand } from '../extension';
import {
  getSelectedText,
  readFromClipboard,
  createEditor,
  runTestCaseInEditor,
} from '../utils';
import testCases from './testCases';
import { memoize } from 'lodash';

const getEditorForLanguage = memoize(async function(language: string) {
  return await createEditor(language);
});

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
  if (!language.startsWith('x')) {
    describe(language, () => {
      for (const type in testCases[language]) {
        if (!type.startsWith('x')) {
          describe(type, () => {
            for (const action in testCases[language][type]) {
              if (!action.startsWith('x')) {
                describe(action, () => {
                  const obj = testCases[language][type][action];
                  if (obj.beforeEach) {
                    beforeEach(obj.beforeEach);
                  }
                  for (const testCase of obj.testCases) {
                    it(testCase.desc, async () => {
                      const editor = await getEditorForLanguage(language);
                      await runTestCaseInEditor(
                        testCase,
                        editor,
                        executeCommand,
                        { type, action }
                      );
                      actionTests[action](testCase, editor);
                    });
                  }
                });
              }
            }
          });
        }
      }
    });
  }
}
