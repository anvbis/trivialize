const _          = require('lodash');
const estraverse = require('estraverse');

const Reducer = require('./reducer');
const Scope   = require('../scope');

const valid_nodes = tree => {
  let nodes = [];
  estraverse.traverse(tree, {
    leave: node => {
      if (node.type != 'Identifier') {
        return;
      }

      let scope = new Scope(tree, node);
      if (scope.contains_literal(node)) {
        nodes.push(node);
      }
    }
  });

  return nodes;
}

class InlineReducer extends Reducer {
  can_reduce() {
    let nodes = valid_nodes(this.tree);
    return nodes.length > 0;
  }

  try_reduce(original_result) {
    let success = false;
    let nodes = valid_nodes(this.tree);

    let index = 0;
    while (index < nodes.length) {
      if (!this.try_replace(index, original_result)) {
        index += 1;
      }
      else {
        nodes = valid_nodes(this.tree);
        success = true;
      }
    }

    return success;
  }

  try_replace(index, original_result) {
    let tree = _.cloneDeep(this.tree);
    let target = valid_nodes(tree)[index];

    let declaration;
    estraverse.traverse(tree, {
      leave: node => {
        if (node.type != 'VariableDeclarator') {
          return;
        }
        if (node.init.type != 'Literal') {
          return;
        }

        if (node.id.name == target.name) {
          declaration = node.init;
          return estraverse.VisitorOption.Break;
        }
      }
    });

    estraverse.replace(tree, {
      leave: node => {
        if (node == target) {
          return declaration;
        }
      }
    });

    return this.test_reduction(tree, original_result);
  }
}

module.exports = InlineReducer;