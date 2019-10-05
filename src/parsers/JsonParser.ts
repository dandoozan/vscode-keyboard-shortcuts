import Parser from './Parser';
import { generateJsonAst, traverseJsonAst } from '../utils';
import NodeFactory from '../factories/NodeFactory';
import { isString, get } from 'lodash';
import Node from '../nodes/Node';

export default class JsonParser extends Parser {
  typeCreators = {
    string: this.createStringNodes,
    block: this.createBlockNodes,
    inner_block: this.createInnerBlockNodes,
  };

  createStringNodes(astNode: any) {
    const nodes: Node[] = [];
    if (
      astNode.type === 'Identifier' ||
      (astNode.type === 'Literal' && isString(astNode.value))
    ) {
      const start = get(astNode, 'loc.start.offset');
      const end = get(astNode, 'loc.end.offset');
      nodes.push(NodeFactory.createNode('string', { start, end }, this.editor));
    }
    return nodes;
  }
  createBlockNodes(astNode: any) {
    const nodes: Node[] = [];
    return nodes;
  }
  createInnerBlockNodes(astNode: any) {
    const nodes: Node[] = [];
    return nodes;
  }

  generateAst(code: string) {
    return generateJsonAst(code);
  }
  traverseAst(astNode: any, fnToApplyToEveryNode: Function) {
    traverseJsonAst(astNode, fnToApplyToEveryNode.bind(this));
  }
}
