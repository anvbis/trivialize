// TODO: AssignmentReducer, ConditionalReducer, NegativeReducer

const ArgumentReducer   = require('./argument');
const ArrayReducer      = require('./array');
const AssignmentReducer = require('./assignment');
const BlockReducer      = require('./block');
const CallReducer       = require('./call');
const ExpressionReducer = require('./expression');
const InlineReducer     = require('./inline');
const ParameterReducer  = require('./parameter');
const StatementReducer  = require('./statement');
const UnwrapReducer     = require('./unwrap');

module.exports = {
  ArgumentReducer,
  ArrayReducer,
  AssignmentReducer,
  BlockReducer,
  CallReducer,
  ExpressionReducer,
  InlineReducer,
  ParameterReducer,
  StatementReducer,
  UnwrapReducer
};
