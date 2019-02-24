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
    isVariableDeclaration,
    isArrayExpression,
    isFunctionExpression,
    isVariableDeclarator,
    isExpressionStatement,
    isArrowFunctionExpression,
} from '@babel/types';
import { get } from 'lodash';

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
        let isBlock = false;

        //include all ExpressionStatements
        if (isExpressionStatement(astNode)) {
            isBlock = true;
        }

        //include any ast node that has a child that is an object, array, or block
        //except for VariableDeclarations or FunctionExpressions
        if (
            !(
                isVariableDeclarator(astNode) ||
                isFunctionExpression(astNode) ||
                isArrowFunctionExpression(astNode)
            )
        ) {
            for (const key in astNode) {
                if (astNode.hasOwnProperty(key)) {
                    const value = astNode[key];
                    if (
                        isObjectExpression(value) ||
                        isArrayExpression(value) ||
                        isBlockStatement(value)
                    ) {
                        isBlock = true;
                    }
                }
            }
        }

        //handle variables
        if (isVariableDeclaration(astNode)) {
            let declarationInit = get(astNode, 'declarations[0].init');
            if (
                isObjectExpression(declarationInit) || //objects
                isArrayExpression(declarationInit) || //arrays
                isFunctionExpression(declarationInit) //functions
            ) {
                isBlock = true;
            }
        }

        if (isBlock) {
            return this.createNode('block', astNode);
        }

        // if (
        //     isFunctionDeclaration(astNode) ||
        //     isForStatement(astNode) ||
        //     isWhileStatement(astNode) ||
        //     isIfStatement(astNode)
        // ) {
        //     return this.createNode('block', astNode);
        // }
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
