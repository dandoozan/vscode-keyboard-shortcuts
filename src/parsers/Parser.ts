import { maxBy, once, fromPairs } from 'lodash';
import Node from '../nodes/Node';

export default abstract class Parser {
    protected typeCreators = {
        string: this.createStringNodes,
        block: this.createBlockNodes,
        parameter: this.createParameterNodes,
    };

    protected abstract createStringNodes(astNode: any): Node[];
    protected abstract createBlockNodes(astNode: any): Node[];
    protected abstract createParameterNodes(astNode: any): Node[];
    protected abstract generateAst(code: string);
    protected abstract traverseAst(astNode: any, fn: Function);

    private parseCode(code: string) {
        //initialize nodesByType as an object with keys as the types and values
        //as empty arrays.  For example: { string: [], block: [] }
        const nodesByType = fromPairs(Object.keys(this.typeCreators).map((key) => [key, []]))

        const ast = this.generateAst(code);
        if (ast) {
            this.traverseAst(ast, (astNode: any) => {
                for (const type in this.typeCreators) {
                    if (this.typeCreators.hasOwnProperty(type)) {
                        const nodes = this.typeCreators[type].call(
                            this,
                            astNode
                        );

                        //add all nodes
                        nodes.forEach(node => {
                            nodesByType[type].push(node);
                        });
                    }
                }
            });
        } else {
            //failed to generate ast; maybe throw an error here or something
        }

        return nodesByType;
    }

    private isCursorInsideNode(node: Node, cursor: number) {
        let cursorBoundary = node.getCursorBoundary(cursor);
        return cursorBoundary.start <= cursor && cursor <= cursorBoundary.end;
    }

    getMostEnclosingNodeOfType(type: string, cursor: number, code: string) {
        const nodesByType = this.parseCode(code);

        //get all enclosing nodes
        const enclosingNodes = nodesByType[type].filter(node =>
            this.isCursorInsideNode(node, cursor)
        );

        //find the "most" enclosing one
        return maxBy(
            enclosingNodes,
            node => (node as Node).getCursorBoundary(cursor).start
        );
    }
}
