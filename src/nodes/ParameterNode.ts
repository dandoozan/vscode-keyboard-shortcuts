import Node from "./Node";
import Boundary from "../Boundary";

export default class ParameterNode extends Node {
    constructor(boundary: Boundary) {
        super('paramater', boundary);
    }

    getActionBoundary(action: string) {
        return this.boundary;
    }
}
