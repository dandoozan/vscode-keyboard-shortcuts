import Node from "./Node";
import Boundary from "../Boundary";
import { TextEditor } from "vscode";

export default class ParameterNode extends Node {
    constructor(boundary: Boundary, editor: TextEditor) {
        super('paramater', boundary, editor);
    }

    getActionBoundary(action: string) {
        return this.boundary;
    }
}
