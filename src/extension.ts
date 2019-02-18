import { ExtensionContext, TextEditor } from 'vscode';
import {
    getFileText,
    getLanguage,
    getCursors,
    addTextEditorCommand,
} from './utils';
import Actions from './Actions';
import Boundary from './Boundary';
import ParserFactory from './factories/ParserFactory'

export const commandConfig = {
    selectString: {
        type: 'string',
        action: 'select',
    },
    deleteString: {
        type: 'string',
        action: 'delete',
    },
    cutString: {
        type: 'string',
        action: 'cut',
    },
    copyString: {
        type: 'string',
        action: 'copy',
    },
    replaceString: {
        type: 'string',
        action: 'replace',
    },

    selectBlockInner: {
        type: 'block',
        action: 'select',
    },
};

export async function executeCommand(editor: TextEditor) {
    //@ts-ignore (i'm ts-ignoring the line below because it complained about the "this")
    const { action, type } = commandConfig[this.commandName];

    const code = getFileText(editor);
    const language = getLanguage(editor);

    const parser = ParserFactory.createParser(language);

    const cursors = getCursors(editor);

    //get the most enclosing node for each cursor
    const nodes = cursors
        .map(cursor => parser.getMostEnclosingNodeOfType(type, cursor, code))
        .filter(item => item); //filter out the undefined ones (an item is undefined when a cursor is outside the item)

    const actionBoundaries = nodes.map(node => node.getActionBoundary(action));

    await Actions[action](editor, actionBoundaries as Boundary[]);
}

export function activate(context: ExtensionContext) {
    for (const commandName in commandConfig) {
        if (commandConfig.hasOwnProperty(commandName)) {
            addTextEditorCommand(
                `vks.${commandName}`,
                executeCommand,
                context,
                { commandName }
            );
        }
    }
}

export function deactivate() {}
