import Node from "./Node";
import { TextEditor } from "vscode";
import { Boundary } from "../utils";

export default class ItemNode extends Node {
    constructor(boundary: Boundary, editor: TextEditor) {
        super('item', boundary, editor);
    }

    getActionBoundary(action: string) {
        return this.boundary;
    }
}
