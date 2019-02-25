import Node from "./Node";
import Boundary from "../Boundary";
import { TextEditor } from "vscode";

export default class ItemNode extends Node {
    constructor(boundary: Boundary, editor: TextEditor) {
        super('item', boundary, editor);
    }

    getActionBoundary(action: string) {
        return this.boundary;
    }
}
