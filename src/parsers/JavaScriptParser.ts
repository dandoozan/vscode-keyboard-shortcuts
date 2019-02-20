import Parser from './Parser';
import { generateBabelAst, traverseBabelAst } from '../utils';
import NodeFactory from '../factories/NodeFactory';
import Boundary from '../Boundary';
import {
    isStringLiteral,
    isTemplateLiteral,
    isDirective,
    isBlockStatement,
    isObjectExpression,
    isFunction,
} from '@babel/types';
import Node from '../nodes/Node';

export default class JavaScriptParser extends Parser {
    typeCreators = {
        string: this.createStringNodes,
        block: this.createBlockNodes,
        inner_block: this.createInnerBlockNodes,
        parameter: this.createParameterNodes,
    };

    createStringNodes(astNode: any) {
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
                    new Boundary(start as number, end as number),
                    this.editor
                )
            );
        }
        return nodes;
    }
    createBlockNodes(astNode: any) {
        const nodes: Node[] = [];
        return nodes;
    }
    createInnerBlockNodes(astNode: any) {
        const nodes: Node[] = [];
        if (isBlockStatement(astNode) || isObjectExpression(astNode)) {
            const { start, end } = astNode;
            nodes.push(
                NodeFactory.createNode(
                    'inner_block',
                    new Boundary(start as number, end as number),
                    this.editor
                )
            );
        }
        return nodes;
    }
    createParameterNodes(astNode: any) {
        if (isFunction(astNode)) {
            return astNode.params.map(paramNode =>
                NodeFactory.createNode(
                    'parameter',
                    new Boundary(
                        paramNode.start as number,
                        paramNode.end as number
                    ),
                    this.editor
                )
            );
        }
        return [];
    }

    generateAst(code: string) {
        return generateBabelAst(code);
    }
    traverseAst(astNode: any, fnToApplyToEveryNode: Function) {
        traverseBabelAst(astNode, fnToApplyToEveryNode.bind(this));
    }
}
