import JavaScriptParser from '../parsers/JavaScriptParser';
import TypeScriptParser from '../parsers/TypeScriptParser';
import JsonParser from '../parsers/JsonParser';
import { TextEditor } from 'vscode';

const PARSER_CLASSES = {
    javascript: JavaScriptParser,
    typescript: TypeScriptParser,
    json: JsonParser,
};

export default class ParserFactory {
    static createParser(language: string, editor: TextEditor) {
        return PARSER_CLASSES[language] ? new PARSER_CLASSES[language](editor) : null;
    }
}
