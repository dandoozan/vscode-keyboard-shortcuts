import JavaScriptParser from './JavaScriptParser';

const PARSER_CLASSES = {
    javascript: JavaScriptParser,
};

export default class ParserFactory {
    static createParser(language: string) {
        return PARSER_CLASSES[language] ? new PARSER_CLASSES[language]() : null;
    }
}
