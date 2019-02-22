import Node from "./Node";
import Boundary from "../Boundary";
import { TextEditor } from "vscode";

export default class BlockNode extends Node {
    constructor(boundary: Boundary, editor: TextEditor) {
        super('block', boundary, editor);
    }

    getActionBoundary(action: string) {
        return this.boundary;
    }
}
