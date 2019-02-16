import { ExtensionContext, TextEditor } from 'vscode';
import {
    getFileText,
    getLanguage,
    isCursorInsideNode,
    isStringNode,
    getCursors,
    Boundary,
    addTextEditorCommand,
    getBoundary,
    parseCode,
    Node,
    isBlockNode,
} from './utils';
import { maxBy } from 'lodash';
import { Actions } from './Actions';

export const commandConfig = {
    selectString: {
        filterFunction: stringFilterFunction,
        action: 'select',
    },
    deleteString: {
        filterFunction: stringFilterFunction,
        action: 'delete',
    },
    cutString: {
        filterFunction: stringFilterFunction,
        action: 'cut',
    },
    copyString: {
        filterFunction: stringFilterFunction,
        action: 'copy',
    },
    replaceString: {
        filterFunction: stringFilterFunction,
        action: 'replace',
    },

    selectBlockInner: {
        filterFunction: blockFilterFunction,
        action: 'select',
    },
};


function stringFilterFunction(node: Node, cursor: number) {
    return isStringNode(node) && isCursorInsideNode(cursor, node);
}

function blockFilterFunction(node: Node, cursor: number) {
    return isBlockNode(node) && isCursorInsideNode(cursor, node);
}

export async function executeCommand(editor: TextEditor) {
    //@ts-ignore (i'm ts-ignoring the line below because it complained about the "this")
    const commandName = this.commandName;

    const commandObj = commandConfig[commandName];
    const nodes = parseCode(getFileText(editor), getLanguage(editor));
    if (nodes) {
        const cursors = getCursors(editor);

        //get the enclosing node for each cursor
        const boundaries = cursors
            .map(cursor => {
                const enclosingNodes = nodes.filter((node: Node) =>
                    commandObj.filterFunction(node, cursor)
                );
                if (enclosingNodes.length > 0) {
                    //get the most enclosing one by finding the one with the last "start" value
                    const mostEnclosingNode = maxBy(enclosingNodes, 'start');
                    return getBoundary(mostEnclosingNode);
                }
            })
            .filter(item => item); //filter out the undefined ones (an item is undefined when a cursor is outside the item)

        await Actions[commandObj.action](editor, boundaries as Boundary[]);
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
