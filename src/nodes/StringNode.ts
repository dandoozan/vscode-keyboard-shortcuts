import Node from "./Node";
import Boundary from "../Boundary";
import { TextEditor } from "vscode";

export default class StringNode extends Node {
    constructor(boundary: Boundary, editor: TextEditor) {
        super('string', boundary, editor);
    }

    getActionBoundary(action: string) {
        return new Boundary(this.boundary.start + 1, this.boundary.end - 1)
    }
}
