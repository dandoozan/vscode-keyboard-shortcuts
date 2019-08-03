import Node from './Node';
import { TextEditor } from 'vscode';
import { Boundary } from '../utils';

export default class BlockNode extends Node {
    constructor(boundary: Boundary, editor: TextEditor) {
        super('block', boundary, editor);
    }

    getCursorBoundary() {
        //exclude the ending brace (so that the cursor has to be inside the
        //ending brace)
        return { start: this.boundary.start, end: this.boundary.end - 1 };
    }
}
