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
    Node as BabelNode,
    isVariableDeclaration,
    isArrayExpression,
    isFunctionExpression,
    isVariableDeclarator,
    isExpressionStatement,
    isArrowFunctionExpression,
    isCallExpression,
} from '@babel/types';
import { get } from 'lodash';

export default class JavaScriptParser extends Parser {
    typeCreators = {
        string: this.createStringNodes,
        block: this.createBlockNodes,
        inner_block: this.createInnerBlockNodes,
        parameter: this.createParameterNodes,
        item: this.createItemNodes,
    };

    createNode(type: string, astNode: BabelNode) {
        const { start, end } = astNode;
        return NodeFactory.createNode(
            type,
            new Boundary(start as number, end as number),
            this.editor
        );
    }

    createStringNodes(astNode: BabelNode) {
        if (
            isStringLiteral(astNode) ||
            isTemplateLiteral(astNode) ||
            isDirective(astNode)
        ) {
            return this.createNode('string', astNode);
        }
    }
    createBlockNodes(astNode: BabelNode) {
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
    createInnerBlockNodes(astNode: BabelNode) {
        if (isBlockStatement(astNode) || isObjectExpression(astNode)) {
            return this.createNode('inner_block', astNode);
        }
    }
    createParameterNodes(astNode: BabelNode) {
        if (isFunction(astNode)) {
            return astNode.params.map(paramNode =>
                this.createNode('parameter', paramNode)
            );
        }
    }
    createItemNodes(astNode: BabelNode) {
        let astNodesToConvertToNodes: (BabelNode | null)[] = [];

        //handle array items
        if (isArrayExpression(astNode)) {
            astNodesToConvertToNodes = astNode.elements;
        }

        //handle parameters
        else if (isFunction(astNode)) {
            astNodesToConvertToNodes = astNode.params;
        }

        //handle arguments
        else if (isCallExpression(astNode)) {
            astNodesToConvertToNodes = astNode.arguments;
        }

        return astNodesToConvertToNodes
            .filter(astNde => astNde) //filter out the null ones
            .map(astNde => this.createNode('item', astNde as BabelNode));
    }

    generateAst(code: string) {
        return generateBabelAst(code);
    }
    traverseAst(astNode: BabelNode, fnToApplyToEveryNode: Function) {
        traverseBabelAst(astNode, fnToApplyToEveryNode.bind(this));
    }
}
