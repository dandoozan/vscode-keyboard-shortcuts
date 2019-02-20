import JavaScriptParser from '../parsers/JavaScriptParser';
import JsonParser from '../parsers/JsonParser';
import { TextEditor } from 'vscode';

const PARSER_CLASSES = {
    javascript: JavaScriptParser,
    json: JsonParser,
};

export default class ParserFactory {
    static createParser(language: string, editor: TextEditor) {
        return PARSER_CLASSES[language] ? new PARSER_CLASSES[language](editor) : null;
    }
}
