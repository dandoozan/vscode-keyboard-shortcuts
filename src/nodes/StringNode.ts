import Node from "./Node";
import Boundary from "../Boundary";

export default class StringNode extends Node {
    constructor(boundary: Boundary) {
        super('string', boundary);
    }

    getActionBoundary(action: string) {
        return new Boundary(this.boundary.start + 1, this.boundary.end - 1)
    }
}
