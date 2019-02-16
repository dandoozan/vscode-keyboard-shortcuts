import { Boundary } from './utils';
import StringNode from './StringNode';

const NODE_CLASSES = {
    string: StringNode,
};

export default class NodeFactory {
    static createNode(type: string, boundary: Boundary) {
        return NODE_CLASSES[type] ? new NODE_CLASSES[type](boundary) : null;
    }
}
