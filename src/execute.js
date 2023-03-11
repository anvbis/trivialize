const escodegen = require('escodegen');
const reprl     = require('../build/Release/reprl');

class Executor {
  constructor(path) {
    const argv = [
      path,
      '--expose-gc',
      '--single-threaded',
      '--predictable',
      '--omit-quit',
      '--allow-natives-syntax',
      '--interrupt-budget=1024',
      '--interrupt-budget-for-maglev=128',
      '--future',
      '--harmony',
      '--fuzzing'
    ];

    let envp = [];
    for (const [key, value] of Object.entries(process.env)) {
      envp.push(`${key}=${value}`);
    }
    
    reprl.initialize_context(argv, envp);
    reprl.execute('', 10000, 1);
  }

  destroy() {
    reprl.destroy_context();
  }

  execute(tree, timeout, fresh_instance) {
    let script = escodegen.generate(tree);

    let re = new RegExp('__NATIVE__', 'g');
    script = script.replace(re, '%');
    
    return reprl.execute(script, timeout, fresh_instance ? 1 : 0);
  }
}

module.exports = Executor;
