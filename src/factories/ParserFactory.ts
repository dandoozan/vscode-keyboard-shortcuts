import JavaScriptParser from '../parsers/JavaScriptParser';
import JsonParser from '../parsers/JsonParser';

const PARSER_CLASSES = {
    javascript: JavaScriptParser,
    json: JsonParser,
};

export default class ParserFactory {
    static createParser(language: string) {
        return PARSER_CLASSES[language] ? new PARSER_CLASSES[language]() : null;
    }
}
