import {
    Boundary,
    createSelectionFromBoundary,
    createDeleteModification,
    makeModifications,
    Modification,
    copy,
    createReplaceModification,
    readFromClipboard,
} from './utils';
import { TextEditor } from 'vscode';

export default class Actions {
    static async select(
        editor: TextEditor,
        boundaries: Boundary[] | undefined
    ) {
        if (boundaries && boundaries.length > 0) {
            editor.selections = boundaries.map(boundary =>
                createSelectionFromBoundary(editor.document, boundary)
            );
        }
    }

    static async delete(
        editor: TextEditor,
        boundaries: Boundary[] | undefined
    ) {
        if (boundaries && boundaries.length > 0) {
            //create a "delete" modification for each string
            const modifications = boundaries.map(boundary =>
                createDeleteModification(editor.document, boundary)
            );

            //do all the modifications
            await makeModifications(editor, modifications as Modification[]);
        }
    }

    static async cut(editor: TextEditor, boundaries: Boundary[] | undefined) {
        if (boundaries && boundaries.length > 0) {
            //first, copy the strings
            await this.copy(editor, boundaries);

            //then delete the strings
            await this.delete(editor, boundaries);
        }
    }

    static async copy(editor: TextEditor, boundaries: Boundary[] | undefined) {
        if (boundaries && boundaries.length > 0) {
            //first, select the strings
            await this.select(editor, boundaries);

            //then execute the copy command
            await copy();
        }
    }

    static async replace(
        editor: TextEditor,
        boundaries: Boundary[] | undefined
    ) {
        if (boundaries && boundaries.length > 0) {
            //create a "replace" modification for each string
            const modifications = boundaries.map(boundary =>
                createReplaceModification(
                    editor.document,
                    boundary,
                    readFromClipboard()
                )
            );

            //do all the modifications
            await makeModifications(editor, modifications as Modification[]);
        }
    }
}
