import Node from "./Node";

import { Boundary } from "./utils";

export default class StringNode extends Node {
    constructor(boundary: Boundary) {
        super('string', boundary);
    }
}
