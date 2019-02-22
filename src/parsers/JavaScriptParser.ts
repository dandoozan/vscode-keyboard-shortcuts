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
    Node,
} from '@babel/types';

export default class JavaScriptParser extends Parser {
    typeCreators = {
        string: this.createStringNodes,
        block: this.createBlockNodes,
        inner_block: this.createInnerBlockNodes,
        parameter: this.createParameterNodes,
    };

    createNode(type: string, astNode: Node) {
        const { start, end } = astNode;
        return NodeFactory.createNode(
            type,
            new Boundary(start as number, end as number),
            this.editor
        );
    }

    createStringNodes(astNode: Node) {
        if (
            isStringLiteral(astNode) ||
            isTemplateLiteral(astNode) ||
            isDirective(astNode)
        ) {
            return this.createNode('string', astNode);
        }
    }
    createBlockNodes(astNode: Node) {
        //check all the children of astNode to see if any are a "BlockStatement"
        for (const key in astNode) {
            if (astNode.hasOwnProperty(key)) {
                const value = astNode[key];
                if (isBlockStatement(value)){// || isObjectExpression(value)) {
                    return this.createNode('block', astNode);
                }
            }
        }
    }
    createInnerBlockNodes(astNode: Node) {
        if (isBlockStatement(astNode) || isObjectExpression(astNode)) {
            return this.createNode('inner_block', astNode);
        }
    }
    createParameterNodes(astNode: Node) {
        if (isFunction(astNode)) {
            return astNode.params.map(paramNode =>
                this.createNode('parameter', paramNode)
            );
        }
    }

    generateAst(code: string) {
        return generateBabelAst(code);
    }
    traverseAst(astNode: Node, fnToApplyToEveryNode: Function) {
        traverseBabelAst(astNode, fnToApplyToEveryNode.bind(this));
    }
}
