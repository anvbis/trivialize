const _          = require('lodash');
const estraverse = require('estraverse');

const Reducer = require('./reducer');

const valid_nodes = tree => {
  let nodes = [];
  estraverse.traverse(tree, {
    leave: node => {
      if (node.type != 'CallExpression') {
        return;
      }
      
      node.arguments.forEach(argument => {
        nodes.push(argument);
      });
    }
  });

  return nodes;
};

class ArgumentReducer extends Reducer {
  can_reduce() {
    let nodes = valid_nodes(this.tree);
    return nodes.length > 0;
  }

  try_reduce(original_result) {
    let success = false;
    let nodes = valid_nodes(this.tree);

    let index = 0;
    while (index < nodes.length) {
      if (!this.try_remove(index, original_result)) {
        index += 1;
      }
      else {
        nodes = valid_nodes(this.tree);
        success = true;
      }
    }

    return success;
  }

  try_remove(index, original_result) {
    let tree = _.cloneDeep(this.tree);
    let target = valid_nodes(tree)[index];

    estraverse.replace(tree, {
      leave: node => {
        if (node == target) {
          return estraverse.VisitorOption.Remove;
        }
      }
    });

    return this.test_reduction(tree, original_result);
  }
}

module.exports = ArgumentReducer;