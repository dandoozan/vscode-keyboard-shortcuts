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

export default class JavaScriptParser extends Parser {
    typeCreators = {
        string: this.createStringNodes,
        block: this.createBlockNodes,
        inner_block: this.createInnerBlockNodes,
        parameter: this.createParameterNodes,
    };

    createNode(type: string, astNode: any) {
        const { start, end } = astNode;
        return NodeFactory.createNode(
            type,
            new Boundary(start as number, end as number),
            this.editor
        );
    }

    createStringNodes(astNode: any) {
        if (
            isStringLiteral(astNode) ||
            isTemplateLiteral(astNode) ||
            isDirective(astNode)
        ) {
            return this.createNode('string', astNode);
        }
    }
    createBlockNodes(astNode: any) {
        //first, check if the ast node has a "body" and that it's a "BlockStatement"
        if (isBlockStatement(astNode.body)) {
            return this.createNode('block', astNode);
        }
    }
    createInnerBlockNodes(astNode: any) {
        if (isBlockStatement(astNode) || isObjectExpression(astNode)) {
            return this.createNode('inner_block', astNode);
        }
    }
    createParameterNodes(astNode: any) {
        if (isFunction(astNode)) {
            return astNode.params.map(paramNode =>
                this.createNode('parameter', paramNode)
            );
        }
    }

    generateAst(code: string) {
        return generateBabelAst(code);
    }
    traverseAst(astNode: any, fnToApplyToEveryNode: Function) {
        traverseBabelAst(astNode, fnToApplyToEveryNode.bind(this));
    }
}
