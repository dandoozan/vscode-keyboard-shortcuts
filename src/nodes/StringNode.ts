import Node from './Node';
import { TextEditor } from 'vscode';
import { Boundary } from '../utils';

export default class StringNode extends Node {
  constructor(boundary: Boundary, editor: TextEditor) {
    super('string', boundary, editor);
  }

  getActionBoundary(action: string) {
    return { start: this.boundary.start + 1, end: this.boundary.end - 1 };
  }
}
