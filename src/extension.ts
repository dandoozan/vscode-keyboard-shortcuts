import { ExtensionContext, TextEditor } from 'vscode';
import {
    getFileText,
    getLanguage,
    getCursors,
    addTextEditorCommand,
    parseCode,
} from './utils';
import { maxBy } from 'lodash';
import Actions from './Actions';
import Node from './Node';
import Boundary from './Boundary';

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
    const commandName = this.commandName;

    const { action, type } = commandConfig[commandName];

    const nodes = parseCode(getFileText(editor), getLanguage(editor));
    if (nodes) {
        const cursors = getCursors(editor);

        //get the enclosing node for each cursor
        const actionBoundaries = cursors
            .map(cursor => {
                const enclosingNodes = nodes.filter((node: Node) => {
                    let cursorBoundary = node.getCursorBoundary(cursor);
                    // console.log('​executeCommand -> cursorBoundary=', cursorBoundary);
                    return (
                        node.type === type &&
                        cursorBoundary.start <= cursor &&
                        cursor <= cursorBoundary.end
                    );
                });

                if (enclosingNodes.length > 0) {
                    //get the most enclosing one by finding the one with the last "start" value
                    const mostEnclosingNode = maxBy(enclosingNodes, node =>
                        node.getCursorBoundary(cursor).start
                    );
                    return (mostEnclosingNode as Node).getActionBoundary(
                        action
                    );
                }
            })
            .filter(item => item); //filter out the undefined ones (an item is undefined when a cursor is outside the item)

        await Actions[action](editor, actionBoundaries as Boundary[]);
    }
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
