var Tape = require('tape');
var HMP = require('../src/hm-parser.js');

Tape.test('parse', t => {
  t.deepEqual(
    HMP.parse('hello :: a -> Maybe a'), {
      name: 'hello',
      constraints: [],
      type:
        {type: 'function', text: '', children: [
          {type: 'typevar', text: 'a', children: []},
          {type: 'typeConstructor', text: 'Maybe', children: [
            {type: 'typevar', text: 'a', children: []}]}]}
  });

  t.deepEqual(
    HMP.parse('x :: [a] -> Integer'), {
      name: 'x',
      constraints: [],
      type:
      {type: 'function', text: '', children: [
        {type: 'list', text: '', children: [
          {type: 'typevar', text: 'a', children: []}]},
        {type: 'typeConstructor', text: 'Integer', children: []}]}
    });

  t.deepEqual(
    HMP.parse('hello :: a -> { x :: String, y :: a }'), {
      name: 'hello',
      constraints: [],
      type:
      {type: 'function', text: '', children: [
        {type: 'typevar', text: 'a', children: []},
        {type: 'record', text: '', children: [
          {type: 'member', text: 'x', children: [
            {type: 'typeConstructor', text: 'String', children: []}]},
          {type: 'member', text: 'y', children: [
            {type: 'typevar', text: 'a', children: []}]}]}]}
    });

  t.deepEqual(
    HMP.parse('hello :: Foo a => a -> String'), {
      name: 'hello',
      constraints: [
        {typeclass: 'Foo', typevar: 'a'}],
      type:
        {type: 'function', text: '', children: [
          {type: 'typevar', text: 'a', children: []},
          {type: 'typeConstructor', text: 'String', children: []}]}});

  t.deepEqual(
    HMP.parse('reduce_ :: Foldable f => ((a, b) -> a) -> a -> f b -> a'), {
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

  t.deepEqual(
    HMP.parse('hello :: (Foo f, Bar a) => (a -> f b) -> [a] -> [Either (Maybe a) b]'), {
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

  t.end();
});

Tape.test('name', t => {
  t.deepEqual(HMP.name('foo'), 'foo');
  t.deepEqual(HMP.name('foo\''), 'foo\'');
  t.deepEqual(HMP.name('Maybe#@@type'),'Maybe#@@type');

  t.end();
});

Tape.test('classConstraints', t => {
  t.deepEqual(HMP.classConstraints('(Eq a, Foo b, Bar b)'), [
    {typeclass: 'Eq', typevar: 'a'},
    {typeclass: 'Foo', typevar: 'b'},
    {typeclass: 'Bar', typevar: 'b'}]);

  t.deepEqual(HMP.classConstraints('(Eq a, Foo b)'), [
    {typeclass: 'Eq', typevar: 'a'},
    {typeclass: 'Foo', typevar: 'b'}]);

  t.deepEqual(HMP.classConstraints('Eq a'), [
    {typeclass: 'Eq', typevar: 'a'}]);

  t.end();
});

Tape.test('typevar', t => {
  t.deepEqual(HMP.typevar('a'),
    {type: 'typevar', text: 'a', children: []});
  t.end();
});

Tape.test('constrainedType', t => {
  t.deepEqual(HMP.constrainedType('f a'),
    {type: 'constrainedType', text: 'f', children: [
      {type: 'typevar', text: 'a', children: []}]});
  t.end();
});

Tape.test('record', t => {
  t.deepEqual(HMP.record('{ foo :: Integer, bar :: Maybe [a] }'),
    {type: 'record', text: '', children: [
      {type: 'member', text: 'foo', children: [
        {type: 'typeConstructor', text: 'Integer', children: []}]},
      {type: 'member', text: 'bar', children: [
        {type: 'typeConstructor', text: 'Maybe', children: [
          {type: 'list', text: '', children: [
            {type: 'typevar', text: 'a', children: []}]}]}]}]});

  t.deepEqual(HMP.record('{ foo :: Integer }'),
    {type: 'record', text: '', children: [
      {type: 'member', text: 'foo', children: [
        {type: 'typeConstructor', text: 'Integer', children: []}]}]});

  t.end();
});

Tape.test('uncurriedFunction', t => {
  t.deepEqual(HMP.uncurriedFunction('(a, b) -> Integer'),
    {type: 'uncurriedFunction', text: '', children: [
      {type: 'parameters', text: '', children: [
        {type: 'typevar', text: 'a', children: []},
        {type: 'typevar', text: 'b', children: []}]},
      {type: 'typeConstructor', text: 'Integer', children: []}]});

  t.deepEqual(HMP.uncurriedFunction('(Bool, [a], Maybe a) -> Either String a'),
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
  t.deepEqual(HMP.method('Foo ~> Integer'),
    {type: 'method', text: '', children: [
      {type: 'typeConstructor', text: 'Foo', children: []},
      {type: 'typeConstructor', text: 'Integer', children: []}]});

  t.deepEqual(HMP.method('Maybe a ~> b -> Boolean'),
    {type: 'method', text: '', children: [
      {type: 'typeConstructor', text: 'Maybe', children: [
        {type: 'typevar', text: 'a', children: []}]},
      {type: 'typevar', text: 'b', children: []},
      {type: 'typeConstructor', text: 'Boolean', children: []}]});

  t.end();
});

Tape.test('function', t => {
  t.deepEqual(HMP.fn('(a -> b) -> [a] -> [b]'),
    {type: 'function', text: '', children: [
      {type: 'function', text: '', children: [
        {type: 'typevar', text: 'a', children: []},
        {type: 'typevar', text: 'b', children: []}]},
      {type: 'list', text: '', children: [
        {type: 'typevar', text: 'a', children: []}]},
      {type: 'list', text: '', children: [
        {type: 'typevar', text: 'b', children: []}]}]});

  t.deepEqual(HMP.fn('(a -> b) -> a -> b'),
    {type: 'function', text: '', children: [
      {type: 'function', text: '', children: [
        {type: 'typevar', text: 'a', children: []},
        {type: 'typevar', text: 'b', children: []}]},
      {type: 'typevar', text: 'a', children: []},
      {type: 'typevar', text: 'b', children: []}]});

  t.deepEqual(HMP.fn('f a -> b'),
    {type: 'function', text: '', children: [
      {type: 'constrainedType', text: 'f', children: [
        {type: 'typevar', text: 'a', children: []}]},
      {type: 'typevar', text: 'b', children: []}]});

  t.deepEqual(HMP.fn('a -> Boolean'),
    {type: 'function', text: '', children: [
      {type: 'typevar', text: 'a', children: []},
      {type: 'typeConstructor', text: 'Boolean', children: []}]});

  t.deepEqual(HMP.fn('Maybe a -> a'),
    {type: 'function', text: '', children: [
      {type: 'typeConstructor', text: 'Maybe', children: [
        {type: 'typevar', text: 'a', children: []}]},
      {type: 'typevar', text: 'a', children: []}]});

  t.deepEqual(HMP.fn('a -> b'),
    {type: 'function', text: '', children: [
      {type: 'typevar', text: 'a', children: []},
      {type: 'typevar', text: 'b', children: []}]});
  t.end();
});

Tape.test('list', t => {
  t.deepEqual(HMP.list('[[Integer]]'),
    {type: 'list', text: '', children: [
      {type: 'list', text: '', children: [
        {type: 'typeConstructor', text: 'Integer', children: []}]}]});

  t.deepEqual(HMP.list('[a]'),
    {type: 'list', text: '', children: [
      {type: 'typevar', text: 'a', children: []}]});

  t.deepEqual(HMP.list('[Maybe a]'),
    {type: 'list', text: '', children: [
      {type: 'typeConstructor', text: 'Maybe', children: [
        {type: 'typevar', text: 'a', children: []}]}]});

  t.deepEqual(HMP.list('[a -> Bool]'),
    {type: 'list', text: '', children: [
      {type: 'function', text: '', children: [
        {type: 'typevar', text: 'a', children: []},
        {type: 'typeConstructor', text: 'Bool', children: []}]}]});

  t.end();
});

Tape.test('typeConstructor', t => {
  t.deepEqual(HMP.typeConstructor('Maybe (Either a (Maybe b))'),
    {type: 'typeConstructor', text: 'Maybe', children: [
      {type: 'typeConstructor', text: 'Either', children: [
        {type: 'typevar', text: 'a', children: []},
        {type: 'typeConstructor', text: 'Maybe', children: [
          {type: 'typevar', text: 'b', children: []}]}]}]});

  t.deepEqual(HMP.typeConstructor('Maybe (Either a b)'),
    {type: 'typeConstructor', text: 'Maybe', children: [
      {type: 'typeConstructor', text: 'Either', children: [
        {type: 'typevar', text: 'a', children: []},
        {type: 'typevar', text: 'b', children: []}]}]});

  t.deepEqual(HMP.typeConstructor('Maybe (f a)'),
    {type: 'typeConstructor', text: 'Maybe', children: [
      {type: 'constrainedType', text: 'f', children: [
        {type: 'typevar', text: 'a', children: []}]}]});

  t.deepEqual(HMP.typeConstructor('Maybe Integer'),
    {type: 'typeConstructor', text: 'Maybe', children: [
      {type: 'typeConstructor', text: 'Integer', children: []}]});

  t.deepEqual(HMP.typeConstructor('Either Integer Bool'),
    {type: 'typeConstructor', text: 'Either', children: [
      {type: 'typeConstructor', text: 'Integer', children: []},
      {type: 'typeConstructor', text: 'Bool', children: []}]});

  t.deepEqual(HMP.typeConstructor('Triple a (Maybe Bool) Integer'),
    {type: 'typeConstructor', text: 'Triple', children: [
      {type: 'typevar', text: 'a', children: []},
      {type: 'typeConstructor', text: 'Maybe', children: [
        {type: 'typeConstructor', text: 'Bool', children: []}]},
      {type: 'typeConstructor', text: 'Integer', children: []}]});

  t.deepEqual(HMP.typeConstructor('Either a (f b)'),
    {type: 'typeConstructor', text: 'Either', children: [
      {type: 'typevar', text: 'a', children: []},
      {type: 'constrainedType', text: 'f', children: [
        {type: 'typevar', text: 'b', children: []}]}]});

  t.deepEqual(HMP.typeConstructor('Either a b'),
    {type: 'typeConstructor', text: 'Either', children: [
      {type: 'typevar', text: 'a', children: []},
      {type: 'typevar', text: 'b', children: []}]});

  t.deepEqual(HMP.typeConstructor('Maybe a'),
    {type: 'typeConstructor', text: 'Maybe', children: [
      {type: 'typevar', text: 'a', children: []}]});

  t.deepEqual(HMP.typeConstructor('A b'),
    {type: 'typeConstructor', text: 'A', children: [
      {type: 'typevar', text: 'b', children: []}]});

  t.deepEqual(HMP.typeConstructor('Bool'),
    {type: 'typeConstructor', text: 'Bool', children: []});

  t.deepEqual(HMP.typeConstructor('A'),
    {type: 'typeConstructor', text: 'A', children: []});
  t.end();
});

