import Boundary from "../Boundary";
import { TextEditor } from "vscode";

export default class Node {
    type: string
    boundary: Boundary
    editor: TextEditor
    constructor(type: string, boundary: Boundary, editor: TextEditor) {
        this.type = type;
        this.boundary = boundary;
        this.editor = editor;
    }

    getActionBoundary(action: string) {
        return this.boundary;
    }

    getCursorBoundary(cursor: number) {
        return this.boundary;
    }
}




