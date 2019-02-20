import { ExtensionContext, TextEditor } from 'vscode';
import {
    getFileText,
    getLanguage,
    getCursors,
    addTextEditorCommand,
    getExtensionCommands,
} from './utils';
import Actions from './Actions';
import Boundary from './Boundary';
import ParserFactory from './factories/ParserFactory';

export async function executeCommand(editor: TextEditor) {
    //@ts-ignore (i'm ts-ignoring the line below because it complained about the "this")
    const { action, type } = this;

    const code = getFileText(editor);
    const language = getLanguage(editor);

    //todo: improve efficiency by persisting the parser between commands (right
    //now, I'm creating a new Parser each time a command is run, meaning the
    //file is re-parsed (ie. an AST is generated from the code) each time)
    const parser = ParserFactory.createParser(language, editor);

    const cursors = getCursors(editor);

    //get the most enclosing node for each cursor
    const nodes = cursors
        .map(cursor => parser.getMostEnclosingNodeOfType(type, cursor, code))
        .filter(item => item); //filter out the undefined ones (an item is undefined when a cursor is outside the item)

    const actionBoundaries = nodes.map(node => node.getActionBoundary(action));

    await Actions[action](editor, actionBoundaries as Boundary[]);
}

export function activate(context: ExtensionContext) {
    const commands = getExtensionCommands();
    commands.forEach(({ command, data }) => {
        addTextEditorCommand(command, executeCommand, context, data);
    });
}

export function deactivate() {}
