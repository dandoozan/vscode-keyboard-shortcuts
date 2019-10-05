import { generateBabelAst } from '../utils';
import JavaScriptParser from './JavaScriptParser';

export default class TypeScriptParser extends JavaScriptParser {
  generateAst(code: string) {
    return generateBabelAst(code, true);
  }
}
