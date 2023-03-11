const _          = require('lodash');
const estraverse = require('estraverse');

const Scope = require('./scope');

function rename_variables(tree) {
  let _tree = _.cloneDeep(tree);

  let nodes = {};
  estraverse.traverse(_tree, {
    leave: node => {
      if (node.type == 'VariableDeclarator' && !(node.id.name in nodes))
        nodes[node.id.name] = `var_${Object.keys(nodes).length}`;

      if (node.type == 'FunctionDeclaration' || node.type == 'FunctionExpression') {
        node.params.forEach(x => {
          if (!(x.name in nodes))
            nodes[x.name] = `arg_${Object.keys(nodes).length}`;
        });
      }
    }
  });

  estraverse.traverse(_tree, {
    leave: (node, parent) => {
      if (node.type == 'Identifier' && parent.type != 'MemberExpression') {
        let s = new Scope(_tree, node);

        if (node.name in nodes && (s.contains(nodes[node.name]) || s.contains(node.name))) {
          node.name = nodes[node.name];
          return;
        }
      }

      if (parent != null && parent.type == 'MemberExpression' && parent.object == node) {
        let s = new Scope(_tree, node);

        if (node.name in nodes && (s.contains(nodes[node.name]) || s.contains(node.name))) {
          node.name = nodes[node.name];
          return;
        }
      }
    }
  });

  return _tree;
}

module.exports = { rename_variables };