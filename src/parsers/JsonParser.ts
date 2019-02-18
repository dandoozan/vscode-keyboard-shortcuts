import Parser from './Parser';
import { generateJsonAst, traverseJsonAst } from '../utils';
import NodeFactory from '../factories/NodeFactory';
import Boundary from '../Boundary';
import { isString, get } from 'lodash';

export default class JsonParser extends Parser {
    private isStringType(astNode) {
        return (
            astNode.type === 'Identifier' ||
            (astNode.type === 'Literal' && isString(astNode.value))
        );
    }

    protected generateAst(code: string) {
        return generateJsonAst(code);
    }
    protected traverseAst(astNode: any, fnToApplyToEveryNode: Function) {
        traverseJsonAst(astNode, fnToApplyToEveryNode.bind(this));
    }
    protected mapAstNodeToTypeNode(astNode: any) {
        const start = get(astNode, 'loc.start.offset');
        const end = get(astNode, 'loc.end.offset');
        if (this.isStringType(astNode)) {
            this.addNode(
                NodeFactory.createNode('string', new Boundary(start, end))
            );
        }
    }
}
