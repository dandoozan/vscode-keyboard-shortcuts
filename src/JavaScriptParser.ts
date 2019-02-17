import { maxBy, isNumber } from 'lodash';
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
};

export default class JavaScriptParser extends Parser {
    nodesByType;

    parseCode(code: string) {
        const nodes = {};

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
                        if (nodes[type]) {
                            nodes[type].push(node);
                        } else {
                            nodes[type] = [node];
                        }
                    }
                }
            });
        } else {
            //failed to generate ast
        }

        return nodes;
    }

    getEnclosingNodesOfType(type: string, cursor: number, code: string) {
        //create nodeGroups if it hasn't been created already
        if (!this.nodesByType) {
            this.nodesByType = this.parseCode(code);
        }

        return this.nodesByType[type].filter(node => {
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
