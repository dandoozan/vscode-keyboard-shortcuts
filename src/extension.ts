import {
    ExtensionContext,
    TextDocument,
    TextEditor,
    TextEditorEdit,
    Selection,
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
    createSelectionFromBoundary,
    copy,
} from './utils';
import { Node } from '@babel/types';
import { maxBy } from 'lodash';

export interface Command {
    filterFunction: Function;
    actionFunction: Function;
}

export const commandConfig = {
    selectString: {
        filterFunction: stringFilterFunction,
        actionFunction: selectStringActionFunction,
    },
    deleteString: {
        filterFunction: stringFilterFunction,
        actionFunction: deleteStringActionFunction,
        //maybe add: excludeBoundaries; modificationFunction
    },
    cutString: {
        filterFunction: stringFilterFunction,
        actionFunction: cutStringActionFunction,
    },
    copyString: {
        filterFunction: stringFilterFunction,
        actionFunction: copyStringActionFunction,
    },
    replaceString: {
        filterFunction: stringFilterFunction,
        actionFunction: replaceStringActionFunction,
    },
};

function stringFilterFunction(node: Node, cursor: number) {
    return isString(node) && isCursorInsideNode(cursor, node);
}


async function selectStringActionFunction(
    editor: TextEditor,
    boundaries: Boundary[]
) {
    //first, remove the quote symbols (so that I only delete the inner string)
    const boundariesWithoutBraces = boundaries.map(excludeBracesFromBoundary);

    editor.selections = boundariesWithoutBraces.map(boundary =>
        createSelectionFromBoundary(editor.document, boundary)
    );
}
async function deleteStringActionFunction(
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
async function cutStringActionFunction(
    editor: TextEditor,
    boundaries: Boundary[]
) {
    //first, copy the strings
    await commandConfig.copyString.actionFunction(editor, boundaries);

    //then delete the strings
    await commandConfig.deleteString.actionFunction(editor, boundaries);
}
async function copyStringActionFunction(
    editor: TextEditor,
    boundaries: Boundary[]
) {
    //first, select the strings
    await commandConfig.selectString.actionFunction(editor, boundaries);

    //then execute the copy command
    await copy();
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

export async function executeCommand(editor: TextEditor) {
    //@ts-ignore (i'm ts-ignoring the line below because it complained about the "this")
    const commandName = this.commandName;

    const commandObj = commandConfig[commandName];
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
                { commandName }
            );
        }
    }
}

export function deactivate() {}
