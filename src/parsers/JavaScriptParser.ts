import { isNumber } from 'lodash';
import Parser from './Parser';
import { generateBabelAst, traverseBabelAst } from '../utils';
import NodeFactory from '../factories/NodeFactory';
import Boundary from '../Boundary';

const BABEL_NODE_TO_TYPE_MAPPING = {
    StringLiteral: 'string',
    TemplateLiteral: 'string',
    Directive: 'string',
    BlockStatement: 'block',
    ObjectExpression: 'block',
};

export default class JavaScriptParser extends Parser {
    protected generateAst(code: string) {
        return generateBabelAst(code);
    }
    protected traverseAst(astNode: any, fnToApplyToEveryNode: Function) {
        traverseBabelAst(astNode, fnToApplyToEveryNode.bind(this));
    }
    protected mapAstNodeToTypeNode(astNode: any) {
        const type = BABEL_NODE_TO_TYPE_MAPPING[astNode.type];
        if (type) {
            const { start, end } = astNode;
            if (isNumber(start) && isNumber(end)) {
                this.addNode(
                    NodeFactory.createNode(type, new Boundary(start, end))
                );
            }
        }
    }
}
