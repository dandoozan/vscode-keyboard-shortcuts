import { TextEditor } from "vscode";
import { Boundary } from "../utils";

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

    getCursorBoundary() {
        return this.boundary;
    }
}




