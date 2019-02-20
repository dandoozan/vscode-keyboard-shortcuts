import StringNode from '../nodes/StringNode';
import Boundary from '../Boundary';
import BlockNode from '../nodes/BlockNode';
import ParameterNode from '../nodes/ParameterNode';
import { TextEditor } from 'vscode';

const NODE_CLASSES = {
    string: StringNode,
    block: BlockNode,
    parameter: ParameterNode
};

export default class NodeFactory {
    static createNode(type: string, boundary: Boundary, editor: TextEditor) {
        return NODE_CLASSES[type] ? new NODE_CLASSES[type](boundary, editor) : null;
    }
}
