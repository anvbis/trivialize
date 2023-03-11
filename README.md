# Trivialize

A tool for javascript engine proof-of-concept simplification.

This useful little tool is a byproduct of my exploration into javascript engine fuzzing. It uses
many of the same techniques that popular fuzzing tools utilise for corpus minimization, just taken
to an extreme degree.

Currently only supports V8, but I plan on adding support for both SpiderMonkey and JavascriptCore
in the future.

## Example

Take this rather complicated regression for CVE-2020-16040 (re-implemented in modern V8). Note that
this is the original regression test found within [Chromium Issue 1150649](https://crbug.com/1150649).

```js
/* examples/cve-2020-16040/regression.js */

function jit_func(a, b) {
  var v921312 = 0xfffffffe;
  let v56971 = 0;  
  var v4951241 = [null, (() => {}), String, "string", v56971];
  let v129341 = [];
  v921312 = NaN;
  if (a != NaN) { 
      v921312 = (0xfffffffe)/2; 
  }
  if (typeof(b) == "string") { 
      v921312 = Math.sign(v921312); 
  }
  v56971 = 0xfffffffe/2 + 1 - Math.sign(v921312 -(-0x1)|6328);
  if (b) {
    v56971 = 0;
  }
  v129341 = new Array(Math.sign(0 - Math.sign(v56971)));
  v129341.shift();
  v4951241 = {};
  v129341.shift();
  v4951241.a = {'a': v129341};  
  for (let i = 0; i < 7; i++) {
    v129341[5] = 2855;
  }
  return v4951241;
}

/* `__NATIVE__` is used instead of `%` for parsing */
__NATIVE__PrepareFunctionForOptimization(jit_func);
jit_func(undefined, "KCGKEMDHOKLAAALLE").toString();
__NATIVE__OptimizeFunctionOnNextCall(jit_func);
jit_func(NaN, undefined).toString();
```

Running the tool against the above regression will result in it performing several
passes of the minimizer against the internal reducer suite.

This provides a much simpler proof-of-concept. In this example, the original regression
has been reduced by almost 70%, from 165 AST nodes at the start, to only 52 at the end.

```
$ ./trivialize.js --script examples/cve-2020-16040/regression.js --rename-variables

Trivialize v0.0.1 (c) Anvbis
https://github.com/anvbis/trivialize

trivialize: info: starting pass 1/?, 165 nodes at start
progress [========================================] 100% | ETA: 0s | 9/9
trivialize: info: 60 nodes at end, 63.64% node reduction

trivialize: info: starting pass 2/?, 60 nodes at start
progress [========================================] 100% | ETA: 0s | 9/9
trivialize: info: 52 nodes at end, 13.33% node reduction

trivialize: info: starting pass 3/?, 52 nodes at start
progress [========================================] 100% | ETA: 0s | 9/9
trivialize: info: 52 nodes at end, 0.00% node reduction

trivialize: info: finished, total node reduction of 68.48%
```

```js
function jit_func(arg_1, arg_2) {
    var var_0 = NaN;
    if (arg_1) {
        var_0 = 4294967294;
    }
    if (typeof arg_2) {
        var_0 = Math.sign(4294967294);
    }
    v56971 = var_0 - -1 | 6328;
}
%PrepareFunctionForOptimization(jit_func);
jit_func();
%OptimizeFunctionOnNextCall(jit_func);
jit_func();
```

## Usage

```
Usage: ./trivialize.js --script <script>

Options:
  --help              Show help                                        [boolean]
  --version           Show version number                              [boolean]
  --script            Target script to reduce                [string] [required]
  --rename-variables  Attempt to rename variables                      [boolean]
  --executable        Path to d8 executable       [string] [default: "./bin/d8"]
  --output            Output script to file                             [string]
```

## Installation

Coming soon...