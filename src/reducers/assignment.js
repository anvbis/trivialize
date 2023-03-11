const _          = require('lodash');
const estraverse = require('estraverse');

const Reducer = require('./reducer');

const valid_nodes = tree => {
  let declarators = [];
  estraverse.traverse(tree, {
    leave: node => {
      if (node.type != 'VariableDeclarator') {
        return;
      }

      declarators.push(node);
    }
  });

  let nodes = [];
  declarators.forEach(declarator => {
    estraverse.traverse(tree, {
      leave: node => {
        if (node.type != 'ExpressionStatement') {
          return;
        }
        if (node.expression.type != 'AssignmentExpression') {
          return;
        }
        if (node.expression.operator != '=') {
          return;
        }
        if (node.expression.left.type != 'Identifier') {
          return;
        }

        if (node.expression.left.name == declarator.id.name) {
          nodes.push(declarator);
        }
      }
    })
  });

  return nodes;
};

class AssignmentReducer extends Reducer {
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

    let assignment;
    estraverse.traverse(tree, {
      leave: node => {
        if (node.type != 'ExpressionStatement') {
          return;
        }
        if (node.expression.type != 'AssignmentExpression') {
          return;
        }
        if (node.expression.operator != '=') {
          return;
        }
        if (node.expression.left.type != 'Identifier') {
          return;
        }

        if (node.expression.left.name == target.id.name) {
          assignment = node;
          return estraverse.VisitorOption.Break;
        }
      }
    });

    estraverse.replace(tree, {
      leave: node => {
        if (node == assignment) {
          return estraverse.VisitorOption.Remove;
        }
      }
    });
    target.init = assignment.expression.right;

    return this.test_reduction(tree, original_result);
  }
}

module.exports = AssignmentReducer;