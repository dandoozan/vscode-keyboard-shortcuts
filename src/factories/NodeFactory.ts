import StringNode from '../nodes/StringNode';
import Boundary from '../Boundary';
import BlockNode from '../nodes/BlockNode';

const NODE_CLASSES = {
    string: StringNode,
    block: BlockNode,
};

export default class NodeFactory {
    static createNode(type: string, boundary: Boundary) {
        return NODE_CLASSES[type] ? new NODE_CLASSES[type](boundary) : null;
    }
}
