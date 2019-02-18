import JavaScriptParser from './JavaScriptParser';
import JsonParser from './JsonParser';

const PARSER_CLASSES = {
    javascript: JavaScriptParser,
    json: JsonParser,
};

export default class ParserFactory {
    static createParser(language: string) {
        return PARSER_CLASSES[language] ? new PARSER_CLASSES[language]() : null;
    }
}
