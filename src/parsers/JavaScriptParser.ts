import Parser from './Parser';
import { generateBabelAst, traverseBabelAst } from '../utils';
import NodeFactory from '../factories/NodeFactory';
import Boundary from '../Boundary';
import { isStringLiteral, isTemplateLiteral, isDirective, isBlockStatement, isObjectExpression } from '@babel/types';
import Node from '../nodes/Node';

export default class JavaScriptParser extends Parser {
    protected createStringNodes(astNode: any) {
        const nodes: Node[] = [];
        if (
            isStringLiteral(astNode) ||
            isTemplateLiteral(astNode) ||
            isDirective(astNode)
        ) {
            const { start, end } = astNode;
            nodes.push(
                NodeFactory.createNode(
                    'string',
                    new Boundary(start as number, end as number)
                )
            );
        }
        return nodes;
    }
    protected createBlockNodes(astNode: any) {
        const nodes: Node[] = [];
        if (isBlockStatement(astNode) || isObjectExpression(astNode)) {
            const { start, end } = astNode;
            nodes.push(
                NodeFactory.createNode(
                    'block',
                    new Boundary(start as number, end as number)
                )
            );
        }
        return nodes;
    }
    protected createParameterNodes(astNode: any) {
        const nodes: Node[] = [];
        return nodes;
    }

    protected generateAst(code: string) {
        return generateBabelAst(code);
    }
    protected traverseAst(astNode: any, fnToApplyToEveryNode: Function) {
        traverseBabelAst(astNode, fnToApplyToEveryNode.bind(this));
    }
}
