import { maxBy, isNumber, isEmpty } from 'lodash';
import Parser from './Parser';
import { generateBabelAst, traverseBabelAst } from './utils';
import NodeFactory from './NodeFactory';
import Boundary from './Boundary';
import Node from './Node';
import { Node as BabelNode } from '@babel/types';

const BABEL_NODE_TO_TYPE_MAPPING = {
    StringLiteral: 'string',
    TemplateLiteral: 'string',
    Directive: 'string',
    BlockStatement: 'block',
    ObjectExpression: 'block',
};

export default class JavaScriptParser extends Parser {
    private nodesByType = {};

    private getNodesByType(code: string) {
        //populate nodesByType if it hasn't been populated already
        if (isEmpty(this.nodesByType)) {
            this.parseCode(code);
        }
        return this.nodesByType;
    }

    private addNode(node: Node) {
        if (this.nodesByType[node.type]) {
            this.nodesByType[node.type].push(node);
        } else {
            this.nodesByType[node.type] = [node];
        }
    }

    private parseCode(code: string) {
        //generate an ast from the code
        const ast = generateBabelAst(code);
        if (ast) {
            //traverse the ast, making a Node for each babelNode along the way
            traverseBabelAst(ast, (babelNode: BabelNode) => {
                const type = BABEL_NODE_TO_TYPE_MAPPING[babelNode.type];
                if (type) {
                    const { start, end } = babelNode;
                    if (isNumber(start) && isNumber(end)) {
                        const node = NodeFactory.createNode(
                            type,
                            new Boundary(start, end)
                        );
                        this.addNode(node);
                    }
                }
            });
        } else {
            //failed to generate ast; maybe throw an error here or something
        }
    }

    private getEnclosingNodesOfType(type: string, cursor: number, code: string) {
        const nodesByType = this.getNodesByType(code);

        return nodesByType[type].filter(node => {
            let cursorBoundary = node.getCursorBoundary(cursor);
            return (
                cursorBoundary.start <= cursor && cursor <= cursorBoundary.end
            );
        });
    }

    getMostEnclosingNodeOfType(type: string, cursor: number, code: string) {
        const enclosingNodes = this.getEnclosingNodesOfType(type, cursor, code);
        return maxBy(
            enclosingNodes,
            node => (node as Node).getCursorBoundary(cursor).start
        );
    }
}
