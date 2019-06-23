import Node from './Node';
import Boundary from '../Boundary';
import { TextEditor } from 'vscode';

export default class BlockNode extends Node {
    constructor(boundary: Boundary, editor: TextEditor) {
        super('block', boundary, editor);
    }

    getCursorBoundary() {
        //exclude the ending brace (so that the cursor has to be inside the
        //ending brace)
        return { start: this.boundary.start, end: this.boundary.end - 1 };
    }

    getActionBoundary(action: string) {
        return this.boundary;
    }
}
