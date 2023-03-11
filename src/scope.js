const estraverse = require('estraverse');

class Scope {
  constructor(tree, node) {
    this.tree = tree;
    this.node = node;

    let scope = {
      node: this.tree,
      parent: null,
      symbols: []
    };

    estraverse.traverse(tree, {
      enter: (node, parent) => {
        if (node.type == 'VariableDeclarator')
          scope.symbols.push(node.id.name);

        if (node.type == 'FunctionDeclaration' || node.type == 'FunctionExpression') {
          if (node.type == 'FunctionExpression') {
            scope.symbols.push(parent.key);
          } else {
            scope.symbols.push(node.id.name);
          }

          scope = {
            node: node.body,
            parent: scope,
            symbols: scope.symbols
          }

          node.params.forEach(x => {
            scope.symbols.push(x.name);
          });
        }
        if (node.type == 'BlockStatement' && parent.type != 'FunctionDeclaration') {
          scope = {
            node: node,
            parent: scope,
            symbols: scope.symbols
          };
        }

        if (node == this.node) {
          this.symbols = scope.symbols;
          this.scope = scope.node;
          return estraverse.VisitorOption.Break;
        }
      },
      leave: node => {
        if (node.type == 'BlockStatement')
          scope = scope.parent;
      }
    });
  }

  contains(symbol) {
    return this.symbols.includes(symbol);
  }

  contains_literal(target) {
    let scope = {
      node: this.tree,
      parent: null,
      literals: []
    };

    let result = false;
    estraverse.traverse(this.tree, {
      enter: node => {
        if (node == target) {
          result = scope.literals.includes(target.name);
          this.scope = scope.node;
          return estraverse.VisitorOption.Break;
        }

        if (node.type == 'BlockStatement') {
          scope = {
            node: node,
            parent: scope,
            literals: scope.literals
          };
        }
      },
      leave: node => {
        if (node.type == 'BlockStatement')
          scope = scope.parent;        

        if (node.type == 'VariableDeclarator' && node.init.type == 'Literal')
          scope.literals.push(node.id.name);
      }
    });

    return result;
  }
}

module.exports = Scope;