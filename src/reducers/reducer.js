const _ = require('lodash');

const is_crash = result => {
  return (result & 0xff) != 0 && (result & 0xff0000) == 0;
}

class Reducer {
  constructor(tree, executor, attempts=1) {
    this.tree = tree;
    this.executor = executor;
    this.attempts = attempts;
  }

  reduce(original_result) {
    for (let i = 0; i < this.attempts; i++) {
      if (this.try_reduce(original_result)) {
        return true;
      }
    }

    return false;
  }

  test_reduction(tree, original_result) {
    let result = this.executor.execute(tree, 100000, false);

    if (result != original_result) {
      return false;
    }

    if (is_crash(result)) {
      this.tree = tree;
      return true;
    }

    throw 'Error: Program does not trigger a crash';
  }
}

module.exports = Reducer;
