
let node = (type, text, children) => {
  return { type, text, children };
};

// structure node, no text
let snode = (type, children) => {
  return node(type, '', children);
};

let id = x => x;

let nth = n => d => d[n];
let head = (d) => d[0];
let head2 = (d) => d[0][0];
let last = (d) => d[d.length - 1];

let pipe = fns => d => {
  let x = d;
  for (let i = 0; i < fns.length; ++i) {
    x = fns[i](x);
  }
  return x;
};

let pick = keys => d => {
  let e = [];
  for (let i = 0; i < keys.length; ++i) {
    e.push(d[keys[i]]);
  }
  return e;
};

let join = x => d => d.join(x);

module.exports = {
  //
  // misc
  //
  head: head,
  head2: head2,
  nth: nth,
  pick: pick,
  //
  // util
  //
  lower: head,
  upper: head,
  alpha: head2,
  word: ([d]) => d.map(head).join(''),
  ufirst: ([x, y]) => x + y.join(''),
  around: pick([0, 2]),
  between: pipe([nth(1), head]),
  delim: ([x, y]) => [
    head(x),
    ...y.map(pipe([nth(1), head]))
  ],
  //
  // HMP
  //
  fn: d => snode(
    'function',
    head(d)),
  uncurriedFn: d => snode(
    'uncurriedFunction',
    [ snode('parameters', head(d)),
      last(d) ]),
  thunk: d => snode(
    'function',
    [ snode('thunk', []),
      head2(d) ]),
  method: pipe([
    head,
    ([x, y]) => snode(
      'method',
      [ head(x),
        ...head(y)])
    ]),
  nullTypeConstructor: ([x]) => node(
    'typeConstructor',
    x,
    []),
  manyTypeConstructor: ([x, y]) => node(
    'typeConstructor',
    x,
    y.map(head)),
  constrainedType: ([x, y]) => node(
    'constrainedType',
    x,
    y.map(head)),
  list: d => snode('list', d),
  record: d => snode(
    'record',
    head(d)),
  typevar: d => node(
    'typevar',
    head(d),
    []
  ),
  keyVal: d => node(
    'field',
    head(d),
    [last(d)]),
  parse: ([name, _, constraints = [], type]) => ({
    name,
    constraints: constraints ? head(constraints) : [],
    type }),
  name: pipe([head, join('')]),
  classConstraint: pipe([
    head,
    ([[typeclass], [typevar]]) => ({ typeclass, typevar })]),
  // we actually want to wrap single class contraint in array of one
  // so instead of the usual `head`, we have `id` here
  classConstraintsOne: id,
  classConstraintsMany: head,
};

