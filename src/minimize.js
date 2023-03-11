const estraverse = require('estraverse');
const progress   = require('cli-progress');

const {
  ArgumentReducer,
  ArrayReducer,
  AssignmentReducer,
  BlockReducer,
  InlineReducer,
  CallReducer,
  ExpressionReducer,
  ParameterReducer,
  StatementReducer,
  UnwrapReducer
} = require('./reducers');

function count_nodes(tree) {
  let count = 0;

  estraverse.traverse(tree, {
    leave: () => {
      count++;
    }
  });

  return count;
}

class Minimizer {
  constructor(tree, executor) {
    this.tree = tree;
    this.executor = executor;

    this.reducers = [
      new BlockReducer(tree, executor),
      new InlineReducer(tree, executor),
      new StatementReducer(tree, executor),
      new CallReducer(tree, executor),
      // new ParameterReducer(tree, executor),
      new ArgumentReducer(tree, executor),
      new ArrayReducer(tree, executor),
      new ExpressionReducer(tree, executor),
      new UnwrapReducer(tree, executor),
      new AssignmentReducer(tree, executor)
    ];
  }

  minimize() {
    let start = count_nodes(this.tree);
    
    let i = 1;
    do {
      console.log(`\ntrivialize: info: starting pass ${i++}/?, ` +
                  `${count_nodes(this.tree)} nodes at start`);
    } while (this.minimize_internal());

    let end = count_nodes(this.tree);
    let reduction = (100 - 100 * end / start).toFixed(2);

    console.log(`\ntrivialize: info: finished, ` +
                `total node reduction of ${reduction}%`);
    return this.tree;
  }

  minimize_internal() {
    let start = count_nodes(this.tree);
    let original_result = this.executor.execute(this.tree, 100000, true);

    const bar = new progress.SingleBar({}, progress.Presets.legacy);
    bar.start(this.reducers.length, 0);

    this.reducers.forEach(x => {
      while (x.can_reduce() && x.reduce(original_result)) {
        this.tree = x.tree;
      };

      this.reducers.forEach(reducer => {
        reducer.tree = this.tree;
      });
      
      bar.increment();
    });

    bar.stop();

    let end = count_nodes(this.tree);
    let reduction = (100 - 100*(end/start)).toFixed(2);

    console.log(`trivialize: info: ${end} nodes at end, ` +
                `${reduction}% node reduction`);
    return start > end;
  }
}

module.exports = Minimizer;