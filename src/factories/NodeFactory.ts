import { TextEditor } from 'vscode';
import StringNode from '../nodes/StringNode';
import Boundary from '../Boundary';
import BlockNode from '../nodes/BlockNode';
import InnerBlockNode from '../nodes/InnerBlockNode';
import ParameterNode from '../nodes/ParameterNode';

const NODE_CLASSES = {
    string: StringNode,
    block: BlockNode,
    inner_block: InnerBlockNode,
    parameter: ParameterNode,
};

export default class NodeFactory {
    static createNode(type: string, boundary: Boundary, editor: TextEditor) {
        return NODE_CLASSES[type] ? new NODE_CLASSES[type](boundary, editor) : null;
    }
}
