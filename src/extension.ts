import { ExtensionContext, TextEditor } from 'vscode';
import {
  getFileText,
  getLanguage,
  getCursors,
  addTextEditorCommand,
  getExtensionCommands,
  Boundary,
  notify,
} from './utils';
import Actions from './Actions';
import ParserFactory from './factories/ParserFactory';
import { isEmpty } from 'lodash';

export async function executeCommand(editor: TextEditor) {
  //@ts-ignore (i'm ts-ignoring the line below because it complains about the "this")
  const { action, type } = this;

  const language = getLanguage(editor);
  const parser = ParserFactory.createParser(language, editor);
  if (parser) {
    const code = getFileText(editor);
    const cursors = getCursors(editor);

    //get the most enclosing node for each cursor
    const nodes = cursors
      .map(cursor => parser.getMostEnclosingNodeOfType(type, cursor, code))
      .filter(item => item); //filter out the undefined ones (an item is undefined when a cursor is outside the item)

    const actionBoundaries = nodes.map(node => node.getActionBoundary(action));

    if (!isEmpty(actionBoundaries)) {
      await Actions[action](editor, actionBoundaries as Boundary[]);
    } else {
      notify(`No enclosing "${type}" found`);
    }
  } else {
    notify(`Failed to create parser for "${language}" language.`);
  }
}

export function activate(context: ExtensionContext) {
  const commands = getExtensionCommands();
  commands.forEach(({ command, data }) => {
    addTextEditorCommand(command, executeCommand, context, data);
  });
}

export function deactivate() {}
