var nearley = require('nearley');
var grammar = require('./grammar.js');

function parse(which, input) {
  let p = new nearley.Parser(grammar.ParserRules, which);
  p.feed(input);
  return p.results[0];
}

let parseNames = [
  'parse',
  'name',
  'classConstraints',
  'type',

  'fn',
  'uncurriedFn',
  'thunk',
  'method',
  'typeConstructor',
  'constrainedType',
  'list',
  'record',
  'typevar',
];
let parsers = {};
for (let i = 0; i < parseNames.length; ++i) {
  let name = parseNames[i];
  parsers[name] = (input) => parse(name, input);
}

module.exports = parsers;

