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
import Node from '../nodes/Node';

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
        let nodes: Node[] = [];

        //include all ExpressionStatements
        if (isExpressionStatement(astNode)) {
            nodes.push(this.createNode('block', astNode));
        }

        //include any ast node that has a child that is an object, array, or block
        //except for VariableDeclarations or FunctionExpressions (handled below)
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
                        nodes.push(this.createNode('block', astNode));
                    }
                }
            }
        }

        //include variables that are objects, arrays, or functions
        if (isVariableDeclaration(astNode)) {
            let declarationInit = get(astNode, 'declarations[0].init');
            if (
                isObjectExpression(declarationInit) || //objects
                isArrayExpression(declarationInit) || //arrays
                isFunctionExpression(declarationInit) || //functions
                isArrowFunctionExpression(declarationInit) //arrow functions
            ) {
                nodes.push(this.createNode('block', astNode));
            }
        }

        //include items in arrays that are objects, arrays, or functions
        if (isArrayExpression(astNode)) {
            astNode.elements.forEach(element => {
                if (element) {
                    if (
                        isObjectExpression(element) || //objects
                        isArrayExpression(element) || //arrays
                        isFunctionExpression(element) || //functions
                        isArrowFunctionExpression(element) //arrow functions
                    ) {
                        nodes.push(this.createNode('block', element));
                    }
                }
            });
        }

        return nodes;
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
