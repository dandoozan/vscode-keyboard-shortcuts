import Node from "./Node";
import Boundary from "../Boundary";
import { TextEditor } from "vscode";
import { getBoundaryText, getLineNumberAtOffset, getFirstNonWhitespaceCharOnLine, getLengthOfLine, getOffsetOfLineAndChar } from "../utils";

export default class InnerBlockNode extends Node {
    constructor(boundary: Boundary, editor: TextEditor) {
        super('inner_block', boundary, editor);
    }
    
    getActionBoundary(action: string) {
        let boundaryStart = this.boundary.start + 1; //exclude the opening bracket
        let boundaryEnd = this.boundary.end - 1; //exclude the ending bracket

        //exclude the newlines after the opening bracket if there is one
        const boundaryText = getBoundaryText(this.boundary, this.editor)
        if (boundaryText[1] === '\n') {
            boundaryStart += 1;
        }

        //exclude the last line if it only contains the closing bracket
        const lastLineNumber = getLineNumberAtOffset(this.boundary.end, this.editor.document);
        const firstNonWhitespaceCharOnLastLine = getFirstNonWhitespaceCharOnLine(lastLineNumber, this.editor.document);
        if (firstNonWhitespaceCharOnLastLine === '}') {
            const previousLineNumber = lastLineNumber - 1;
            const endOfPreviousLine = getLengthOfLine(previousLineNumber, this.editor.document)
            boundaryEnd = getOffsetOfLineAndChar(previousLineNumber, endOfPreviousLine, this.editor.document);
        }

        return new Boundary(boundaryStart, boundaryEnd)
    }


}
