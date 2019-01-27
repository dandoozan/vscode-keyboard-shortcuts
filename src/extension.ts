import {
    ExtensionContext,
    TextDocument,
    TextEditor,
    TextEditorEdit,
} from 'vscode';
import {
    generateAst,
    getCurrentEditor,
    getTextOfFile,
    getLanguage,
    getCursor,
    addCommand,
    deleteBetweenBoundary,
    filterAst,
    isCursorInsideNode,
    getBoundaryExcludingBraces,
    isString,
    getCursors,
    createDeleteModification,
    Modification,
    makeModifications,
    Boundary,
    paste,
    addTextEditorCommand,
    readFromClipboard,
    createReplaceModification,
    getBoundary,
    excludeBracesFromBoundary,
} from './utils';
import { Node } from '@babel/types';
import { maxBy } from 'lodash';

export interface Command {
    filterFunction: Function;
    actionFunction: Function;
}

export const commandConfig = {
    deleteInnerString: {
        filterFunction: stringFilterFunction,
        actionFunction: deleteInnerStringActionFunction,
        //maybe add: excludeBoundaries; modificationFunction
    },
    replaceString: {
        filterFunction: stringFilterFunction,
        actionFunction: replaceStringActionFunction,
    },
};

function stringFilterFunction(node: Node, cursor: number) {
    return isString(node) && isCursorInsideNode(cursor, node);
}
async function replaceStringActionFunction(
    editor: TextEditor,
    boundaries: Boundary[]
) {
    //first, remove the quote symbols (so that I only replace the inner string)
    const boundariesWithoutBraces = boundaries.map(excludeBracesFromBoundary);

    //create a "replace" modification for each string
    const modifications = boundariesWithoutBraces.map(boundary =>
        createReplaceModification(
            editor.document,
            boundary,
            readFromClipboard()
        )
    );

    //do all the modifications
    await makeModifications(editor, modifications as Modification[]);
}
async function deleteInnerStringActionFunction(
    editor: TextEditor,
    boundaries: Boundary[]
) {
    //first, remove the quote symbols (so that I only delete the inner string)
    const boundariesWithoutBraces = boundaries.map(excludeBracesFromBoundary);

    //create a "delete" modification for each string
    const modifications = boundariesWithoutBraces.map(boundary =>
        createDeleteModification(editor.document, boundary)
    );

    //do all the modifications
    await makeModifications(editor, modifications as Modification[]);
}

export async function executeCommand(
    editor: TextEditor,
    command: string
) {
    const commandObj = commandConfig[command];
    const ast = generateAst(getTextOfFile(editor), getLanguage(editor));
    if (ast) {
        const cursors = getCursors(editor);

        //map the cursors to boundaries
        const boundaries = cursors
            .map(cursor => {
                const enclosingNodes = filterAst(
                    ast,
                    cursor,
                    commandObj.filterFunction
                );

                if (enclosingNodes.length > 0) {
                    //get the most enclosing one by finding the one with the last "start" value
                    const mostEnclosingNode = maxBy(enclosingNodes, 'start');
                    return getBoundary(mostEnclosingNode);
                }
            })
            .filter(item => item); //filter out the undefined ones (an item is undefined when a cursor is outside the item)

        await commandObj.actionFunction(editor, boundaries);
    }
}

export function activate(context: ExtensionContext) {
    for (const commandName in commandConfig) {
        if (commandConfig.hasOwnProperty(commandName)) {
            addTextEditorCommand(
                `vks.${commandName}`,
                executeCommand,
                context,
                commandName
            );
        }
    }
}

export function deactivate() {}
