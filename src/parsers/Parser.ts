import { isEmpty, maxBy } from "lodash";
import Node from "../nodes/Node";

export default abstract class Parser {
    protected nodesByType = {};

    protected getNodesByType(code: string) {
        //populate nodesByType if it hasn't been populated already
        if (isEmpty(this.nodesByType)) {
            this.parseCode(code);
        }
        return this.nodesByType;
    }

    protected addNode(node: Node) {
        if (this.nodesByType[node.type]) {
            this.nodesByType[node.type].push(node);
        } else {
            this.nodesByType[node.type] = [node];
        }
    }

    protected generateAst(code: string): any {
        //to be implemented by the subclass
    }
    protected traverseAst(astNode: any, fnToApplyToEveryNode: Function) {
        //to be implemented by the subclass
    }
    protected mapAstNodeToTypeNode(astNode: any) {
        //to be implemented by the subclass
    }

    protected parseCode(code: string) {
        const ast = this.generateAst(code);
        if (ast) {
            this.traverseAst(ast, this.mapAstNodeToTypeNode);
        } else {
            //failed to generate ast; maybe throw an error here or something
        }
    }

    protected getEnclosingNodesOfType(type: string, cursor: number, code: string) {
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
