import { Boundary } from "./utils";

export default class Node {
    type: string
    boundary: Boundary
    constructor(type: string, boundary: Boundary) {
        this.type = type;
        this.boundary = boundary;
    }

    getActionBoundary(action: string) {
        return this.boundary;
    }

    getCursorBoundary(cursor: number) {
        return this.boundary;
    }
}




