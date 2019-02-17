import Node from "./Node";
import Boundary from "./Boundary";

export default class BlockNode extends Node {
    constructor(boundary: Boundary) {
        super('block', boundary);
    }

    getActionBoundary(action: string) {
        return new Boundary(this.boundary.start + 1, this.boundary.end - 1)
    }
}
