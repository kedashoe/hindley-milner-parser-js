var Tape = require('tape');
var HMP = require('../dist/index.js');

let run = (t, f) => (input, expected) => t.deepEqual(f(input), expected, input);

Tape.test('parse', t => {
  let r = run(t, HMP.parse);

  r('hello :: a -> Maybe a', {
    name: 'hello',
    constraints: [],
    type:
      {type: 'function', text: '', children: [
        {type: 'typevar', text: 'a', children: []},
        {type: 'typeConstructor', text: 'Maybe', children: [
          {type: 'typevar', text: 'a', children: []}]}]}});

  r('x :: [a] -> Integer', {
    name: 'x',
    constraints: [],
    type:
    {type: 'function', text: '', children: [
      {type: 'list', text: '', children: [
        {type: 'typevar', text: 'a', children: []}]},
      {type: 'typeConstructor', text: 'Integer', children: []}]}});

  r('hello :: a -> { x :: String, y :: a }', {
    name: 'hello',
    constraints: [],
    type:
    {type: 'function', text: '', children: [
      {type: 'typevar', text: 'a', children: []},
      {type: 'record', text: '', children: [
        {type: 'field', text: 'x', children: [
          {type: 'typeConstructor', text: 'String', children: []}]},
        {type: 'field', text: 'y', children: [
          {type: 'typevar', text: 'a', children: []}]}]}]}});

  r('Maybe#chain :: Maybe a ~> (a -> Maybe b) -> Maybe b', {
    name: 'Maybe#chain',
    constraints: [],
    type:
    {type: 'method', text: '', children: [
      {type: 'typeConstructor', text: 'Maybe', children: [
        {type: 'typevar', text: 'a', children:[]}]},
      {type: 'function', text: '', children: [
        {type: 'typevar', text: 'a', children: []},
        {type: 'typeConstructor', text: 'Maybe', children: [
          {type: 'typevar', text: 'b', children: []}]}]},
      {type: 'typeConstructor', text: 'Maybe', children: [
        {type: 'typevar', text: 'b', children: []}]}]}});

  r('hello :: Foo a => a -> String', {
    name: 'hello',
    constraints: [
      {typeclass: 'Foo', typevar: 'a'}],
    type:
    {type: 'function', text: '', children: [
      {type: 'typevar', text: 'a', children: []},
      {type: 'typeConstructor', text: 'String', children: []}]}});

  r('reduce_ :: Foldable f => ((a, b) -> a) -> a -> f b -> a', {
    name: 'reduce_',
    constraints: [
      {typeclass: 'Foldable', typevar: 'f'}],
    type:
    {type: 'function', text: '', children: [
      {type: 'uncurriedFunction', text: '', children: [
        {type: 'parameters', text: '', children: [
          {type: 'typevar', text: 'a', children: []},
          {type: 'typevar', text: 'b', children: []}]},
        {type: 'typevar', text: 'a', children: []}]},
      {type: 'typevar', text: 'a', children: []},
      {type: 'constrainedType', text: 'f', children: [
        {type: 'typevar', text: 'b', children: []}]},
      {type: 'typevar', text: 'a', children: []}]}});

  r('hello :: (Foo f, Bar a) => (a -> f b) -> [a] -> [Either (Maybe a) b]', {
    name: 'hello',
    constraints: [
      {typeclass: 'Foo', typevar: 'f'},
      {typeclass: 'Bar', typevar: 'a'}],
    type:
    {type: 'function', text: '', children: [
      {type: 'function', text: '', children: [
        {type: 'typevar', text: 'a', children: []},
        {type: 'constrainedType', text: 'f', children: [
          {type: 'typevar', text: 'b', children: []}]}]},
      {type: 'list', text: '', children: [
        {type: 'typevar', text: 'a', children: []}]},
      {type: 'list', text: '', children: [
        {type: 'typeConstructor', text: 'Either', children: [
          {type: 'typeConstructor', text: 'Maybe', children: [
            {type: 'typevar', text: 'a', children: []}]},
          {type: 'typevar', text: 'b', children: []}]}]}]}});

  r('sum :: Foldable f => f FiniteNumber -> FiniteNumber', {
    name: 'sum',
    constraints: [
      {typeclass: 'Foldable', typevar: 'f'}],
    type:
    {type: 'function', text: '', children: [
      {type: 'constrainedType', text: 'f', children: [
        {type: 'typeConstructor', text: 'FiniteNumber', children: []}]},
      {type: 'typeConstructor', text: 'FiniteNumber', children: []}]}});

  r('promap :: Profunctor p => (a -> b, c -> d, p b c) -> p a d', {
    name: 'promap',
    constraints: [
      {typeclass: 'Profunctor', typevar: 'p'}],
    type:
    {type: 'uncurriedFunction', text: '', children: [
      {type: 'parameters', text: '', children: [
        {type: 'function', text: '', children: [
          {type: 'typevar', text: 'a', children:[]},
          {type: 'typevar', text: 'b', children:[]}]},
        {type: 'function', text: '', children: [
          {type: 'typevar', text: 'c', children:[]},
          {type: 'typevar', text: 'd', children:[]}]},
        {type: 'constrainedType', text: 'p', children: [
          {type: 'typevar', text: 'b', children:[]},
          {type: 'typevar', text: 'c', children:[]}]}]},
      {type: 'constrainedType', text: 'p', children: [
        {type: 'typevar', text: 'a', children:[]},
        {type: 'typevar', text: 'd', children:[]}]}]}});

  r('maybe_ :: (() -> b) -> (a -> b) -> Maybe a -> b', {
    name: 'maybe_',
    constraints: [],
    type:
    {type: 'function', text: '', children: [
      {type: 'function', text: '', children: [
        {type: 'thunk', text: '', children: []},
        {type: 'typevar', text: 'b', children: []}]},
      {type: 'function', text: '', children: [
        {type: 'typevar', text: 'a', children: []},
        {type: 'typevar', text: 'b', children: []}]},
      {type: 'typeConstructor', text: 'Maybe', children: [
        {type: 'typevar', text: 'a', children: []}]},
      {type: 'typevar', text: 'b', children: []}]}});

  t.end();
});

Tape.test('name', t => {
  let r = run(t, HMP.name);

  r('foo', 'foo');
  r('foo\'', 'foo\'');
  r('Maybe#@@type','Maybe#@@type');

  t.end();
});

Tape.test('classConstraints', t => {
  let r = run(t, HMP.classConstraints);

  r('(Eq a, Foo b, Bar b)', [
    {typeclass: 'Eq', typevar: 'a'},
    {typeclass: 'Foo', typevar: 'b'},
    {typeclass: 'Bar', typevar: 'b'}]);

  r('(Eq a, Foo b)', [
    {typeclass: 'Eq', typevar: 'a'},
    {typeclass: 'Foo', typevar: 'b'}]);

  r('Eq a', [
    {typeclass: 'Eq', typevar: 'a'}]);

  t.end();
});

Tape.test('typevar', t => {
  let r = run(t, HMP.typevar);

  r('a',
    {type: 'typevar', text: 'a', children: []});
  r('foo',
    {type: 'typevar', text: 'foo', children: []});

  t.end();
});

Tape.test('thunk', t => {
  let r = run(t, HMP.thunk);

  r('() -> Maybe a',
    {type: 'function', text: '', children: [
      {type: 'thunk', text: '', children: []},
      {type: 'typeConstructor', text: 'Maybe', children: [
        {type: 'typevar', text: 'a', children: []}]}]});

  r('() -> a',
    {type: 'function', text: '', children: [
      {type: 'thunk', text: '', children: []},
      {type: 'typevar', text: 'a', children: []}]});

  t.end();
});

Tape.test('constrainedType', t => {
  let r = run(t, HMP.constrainedType);

  r('f a',
    {type: 'constrainedType', text: 'f', children: [
      {type: 'typevar', text: 'a', children: []}]});

  r('p a b',
    {type: 'constrainedType', text: 'p', children: [
      {type: 'typevar', text: 'a', children: []},
      {type: 'typevar', text: 'b', children: []}]});

  r('f Integer',
    {type: 'constrainedType', text: 'f', children: [
      {type: 'typeConstructor', text: 'Integer', children: []}]});

  t.end();
});

Tape.test('record', t => {
  let r = run(t, HMP.record);

  r('{ foo :: Integer, bar :: Maybe [a] }',
    {type: 'record', text: '', children: [
      {type: 'field', text: 'foo', children: [
        {type: 'typeConstructor', text: 'Integer', children: []}]},
      {type: 'field', text: 'bar', children: [
        {type: 'typeConstructor', text: 'Maybe', children: [
          {type: 'list', text: '', children: [
            {type: 'typevar', text: 'a', children: []}]}]}]}]});

  r('{ foo :: Integer }',
    {type: 'record', text: '', children: [
      {type: 'field', text: 'foo', children: [
        {type: 'typeConstructor', text: 'Integer', children: []}]}]});

  t.end();
});

Tape.test('uncurriedFunction', t => {
  let r = run(t, HMP.uncurriedFn);

  r('(a, b) -> Integer',
    {type: 'uncurriedFunction', text: '', children: [
      {type: 'parameters', text: '', children: [
        {type: 'typevar', text: 'a', children: []},
        {type: 'typevar', text: 'b', children: []}]},
      {type: 'typeConstructor', text: 'Integer', children: []}]});

  r('(Bool, [a], Maybe a) -> Either String a',
    {type: 'uncurriedFunction', text: '', children: [
      {type: 'parameters', text: '', children: [
        {type: 'typeConstructor', text: 'Bool', children: []},
        {type: 'list', text: '', children: [
          {type: 'typevar', text: 'a', children:[]}]},
        {type: 'typeConstructor', text: 'Maybe', children: [
          {type: 'typevar', text: 'a', children:[]}]}]},
      {type: 'typeConstructor', text: 'Either', children: [
        {type: 'typeConstructor', text: 'String', children: []},
        {type: 'typevar', text: 'a', children:[]}]}]});

  t.end();
});

Tape.test('method', t => {
  let r = run(t, HMP.method);

  r('Foo ~> Integer',
    {type: 'method', text: '', children: [
      {type: 'typeConstructor', text: 'Foo', children: []},
      {type: 'typeConstructor', text: 'Integer', children: []}]});

  r('Maybe a ~> b -> Boolean',
    {type: 'method', text: '', children: [
      {type: 'typeConstructor', text: 'Maybe', children: [
        {type: 'typevar', text: 'a', children: []}]},
      {type: 'typevar', text: 'b', children: []},
      {type: 'typeConstructor', text: 'Boolean', children: []}]});

  t.end();
});

Tape.test('function', t => {
  let r = run(t, HMP.fn);

  r('(a -> b) -> [a] -> [b]',
    {type: 'function', text: '', children: [
      {type: 'function', text: '', children: [
        {type: 'typevar', text: 'a', children: []},
        {type: 'typevar', text: 'b', children: []}]},
      {type: 'list', text: '', children: [
        {type: 'typevar', text: 'a', children: []}]},
      {type: 'list', text: '', children: [
        {type: 'typevar', text: 'b', children: []}]}]});

  r('(a -> b) -> a -> b',
    {type: 'function', text: '', children: [
      {type: 'function', text: '', children: [
        {type: 'typevar', text: 'a', children: []},
        {type: 'typevar', text: 'b', children: []}]},
      {type: 'typevar', text: 'a', children: []},
      {type: 'typevar', text: 'b', children: []}]});

  r('f a -> b',
    {type: 'function', text: '', children: [
      {type: 'constrainedType', text: 'f', children: [
        {type: 'typevar', text: 'a', children: []}]},
      {type: 'typevar', text: 'b', children: []}]});

  r('a -> Boolean',
    {type: 'function', text: '', children: [
      {type: 'typevar', text: 'a', children: []},
      {type: 'typeConstructor', text: 'Boolean', children: []}]});

  r('Maybe a -> a',
    {type: 'function', text: '', children: [
      {type: 'typeConstructor', text: 'Maybe', children: [
        {type: 'typevar', text: 'a', children: []}]},
      {type: 'typevar', text: 'a', children: []}]});

  r('a -> b',
    {type: 'function', text: '', children: [
      {type: 'typevar', text: 'a', children: []},
      {type: 'typevar', text: 'b', children: []}]});

  t.end();
});

Tape.test('list', t => {
  let r = run(t, HMP.list);

  r('[[Integer]]',
    {type: 'list', text: '', children: [
      {type: 'list', text: '', children: [
        {type: 'typeConstructor', text: 'Integer', children: []}]}]});

  r('[a]',
    {type: 'list', text: '', children: [
      {type: 'typevar', text: 'a', children: []}]});

  r('[Maybe a]',
    {type: 'list', text: '', children: [
      {type: 'typeConstructor', text: 'Maybe', children: [
        {type: 'typevar', text: 'a', children: []}]}]});

  r('[a -> Bool]',
    {type: 'list', text: '', children: [
      {type: 'function', text: '', children: [
        {type: 'typevar', text: 'a', children: []},
        {type: 'typeConstructor', text: 'Bool', children: []}]}]});

  t.end();
});

Tape.test('typeConstructor', t => {
  let r = run(t, HMP.typeConstructor);

  r('Maybe (Either a (Maybe b))',
    {type: 'typeConstructor', text: 'Maybe', children: [
      {type: 'typeConstructor', text: 'Either', children: [
        {type: 'typevar', text: 'a', children: []},
        {type: 'typeConstructor', text: 'Maybe', children: [
          {type: 'typevar', text: 'b', children: []}]}]}]});

  r('Maybe (Either a b)',
    {type: 'typeConstructor', text: 'Maybe', children: [
      {type: 'typeConstructor', text: 'Either', children: [
        {type: 'typevar', text: 'a', children: []},
        {type: 'typevar', text: 'b', children: []}]}]});

  r('Maybe (f a)',
    {type: 'typeConstructor', text: 'Maybe', children: [
      {type: 'constrainedType', text: 'f', children: [
        {type: 'typevar', text: 'a', children: []}]}]});

  r('Maybe Integer',
    {type: 'typeConstructor', text: 'Maybe', children: [
      {type: 'typeConstructor', text: 'Integer', children: []}]});

  r('Either Integer Bool',
    {type: 'typeConstructor', text: 'Either', children: [
      {type: 'typeConstructor', text: 'Integer', children: []},
      {type: 'typeConstructor', text: 'Bool', children: []}]});

  r('Triple a (Maybe Bool) Integer',
    {type: 'typeConstructor', text: 'Triple', children: [
      {type: 'typevar', text: 'a', children: []},
      {type: 'typeConstructor', text: 'Maybe', children: [
        {type: 'typeConstructor', text: 'Bool', children: []}]},
      {type: 'typeConstructor', text: 'Integer', children: []}]});

  r('Either a (f b)',
    {type: 'typeConstructor', text: 'Either', children: [
      {type: 'typevar', text: 'a', children: []},
      {type: 'constrainedType', text: 'f', children: [
        {type: 'typevar', text: 'b', children: []}]}]});

  r('Either a b',
    {type: 'typeConstructor', text: 'Either', children: [
      {type: 'typevar', text: 'a', children: []},
      {type: 'typevar', text: 'b', children: []}]});

  r('Maybe a',
    {type: 'typeConstructor', text: 'Maybe', children: [
      {type: 'typevar', text: 'a', children: []}]});

  r('A b',
    {type: 'typeConstructor', text: 'A', children: [
      {type: 'typevar', text: 'b', children: []}]});

  r('Bool',
    {type: 'typeConstructor', text: 'Bool', children: []});

  r('A',
    {type: 'typeConstructor', text: 'A', children: []});

  t.end();
});

// these parse attempts fail with nil, but nearley does not throw
// we throw when we get null back, which is what we are detecting here
let nilError = (t, input) => (parser) => {
  let expected = new RegExp(`Hindley Milner Parser: could not parse "${input}" as "${parser}"`);
  t.throws(() => HMP[parser](input), expected, `nil error parsing "${input}" as "${parser}"`);
};

// these parse attempts fail with a thrown Error from nearley
let throwError = (t, input) => (parser) => {
  let expected = new RegExp(`invalid syntax`);
  t.throws(() => HMP[parser](input), expected, `throw parsing "${input}" as "${parser}"`);
};

Tape.test('throws when input cannot be parsed', t => {
  let nilTest = nilError(t, 'foo');
  let throwTest = throwError(t, 'foo');

  nilTest('parse');
  nilTest('fn');

  throwTest('method');
  throwTest('typeConstructor');

  t.end();
});

