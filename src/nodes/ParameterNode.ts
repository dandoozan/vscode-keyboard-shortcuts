import Node from './Node';
import { TextEditor } from 'vscode';
import { Boundary } from '../utils';

export default class ParameterNode extends Node {
  constructor(boundary: Boundary, editor: TextEditor) {
    super('paramater', boundary, editor);
  }
}
