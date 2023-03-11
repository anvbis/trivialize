#!/usr/bin/env node

const fs        = require('fs');
const esprima   = require('esprima');
const escodegen = require('escodegen');
const yargs     = require('yargs');

const Executor  = require('./src/execute');
const Minimizer = require('./src/minimize');

const { rename_variables } = require('./src/prettify');

const options = yargs
 .usage('Usage: ./$0 --script <script>')
 .option('script', {
  describe: 'Target script to reduce',
  type: 'string',
  demandOption: true
 })
 .option('rename-variables', {
  describe: 'Attempt to rename variables',
  type: 'boolean'
 })
 .option('executable', {
  describe: 'Path to d8 executable',
  type: 'string',
  default: './bin/d8'
 })
 .option('output', {
  describe: 'Output script to file',
  type: 'string'
 })
 .argv;

console.log('Trivialize v0.0.1 (c) Anvbis');
console.log('https://github.com/anvbis/trivialize');

let script = fs.readFileSync(options.script, 'utf-8');
let tree = esprima.parseScript(script);

let executor = new Executor(options.executable);
let minimizer = new Minimizer(tree, executor);

tree = minimizer.minimize();
if (options['rename-variables']) {
  tree = rename_variables(tree);
}

executor.destroy();

let re = new RegExp('__NATIVE__', 'g');
let code = escodegen.generate(tree).replace(re, '%');

if (options.output) {
  fs.writeFileSync(options.output, code);
}
else {
  console.log(`\n---\n\n${code}`);
}
