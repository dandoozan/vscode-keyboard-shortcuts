import Parser from './Parser';
import { generateJsonAst, traverseJsonAst } from '../utils';
import NodeFactory from '../factories/NodeFactory';
import Boundary from '../Boundary';
import { isString, get } from 'lodash';
import Node from '../nodes/Node';

export default class JsonParser extends Parser {

    protected createStringNodes(astNode: any) {
        const nodes: Node[] = [];
        if (
            astNode.type === 'Identifier' ||
            (astNode.type === 'Literal' && isString(astNode.value))
        ) {
            const start = get(astNode, 'loc.start.offset');
            const end = get(astNode, 'loc.end.offset');
            nodes.push(NodeFactory.createNode('string', new Boundary(start, end)));
        }
        return nodes;
    }
    protected createBlockNodes(astNode: any) {
        const nodes: Node[] = [];
        return nodes;
    }
    protected createParameterNodes(astNode: any) {
        const nodes: Node[] = [];
        return nodes;
    }

    protected generateAst(code: string) {
        return generateJsonAst(code);
    }
    protected traverseAst(astNode: any, fnToApplyToEveryNode: Function) {
        traverseJsonAst(astNode, fnToApplyToEveryNode.bind(this));
    }
}
