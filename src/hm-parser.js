var m = require('mona');

var WRAP_FN = 1;
var WRAP_TYPE_CONSTRUCTOR = 2;
var WRAP_CONSTRAINED_TYPE = 4;
var WRAP_UC_FN = 8;

var WRAP_FNS = WRAP_FN | WRAP_UC_FN;
var WRAP_ALL = WRAP_FNS | WRAP_TYPE_CONSTRUCTOR | WRAP_CONSTRAINED_TYPE;

function upperWord() {
  return m.stringOf(
    m.join(
      m.alphaUpper(),
      m.stringOf(
        m.collect(
          m.alpha()
        )
      )
    )
  );
}

function lowerWord() {
  return m.stringOf(
    m.collect(
      m.alphaLower(),
      { min: 1 }
    )
  );
}

function name() {
  return m.stringOf(
    m.collect(
      m.noneOf(' ')
    )
  );
}

function classConstraint() {
  return m.map(
    ([typeclass, typevar]) => ({ typeclass, typevar }),
    m.join(
      m.followedBy(
        upperWord(),
        m.space()
      ),
      lowerWord()
    )
  );
}

function classConstraints() {
  return m.or(
    m.delay(wrappedClassConstraints),
    m.map(x => [x], classConstraint())
  );
}

function wrappedClassConstraints() {
  return m.between(
    m.string('('),
    m.string(')'),
    m.split(
      classConstraint(),
      m.string(', ')
    )
  );
}

function list() {
  return m.map(
    child => ({ type: 'list', text: '', children: [child] }),
    m.between(
      m.string('['),
      m.string(']'),
      type()
    )
  );
}

// to help handle child typeConstructors
// eg "Integer" in `Maybe Integer`
function nullaryTypeConstructor() {
  return m.map(
    text => ({type: 'typeConstructor', text, children: [] }),
    upperWord()
  );
}

function typeConstructor() {
  return m.map(
    ([text, children]) => ({ type: 'typeConstructor', text, children }),
    m.join(
      upperWord(),
      m.collect(
        m.and(
          m.spaces(),
          m.or(
            nullaryTypeConstructor(),
            type(WRAP_ALL)
          )
        )
      )
    )
  );
}

function wrappedTypeConstructor() {
  return m.between(
    m.string('('),
    m.string(')'),
    m.delay(typeConstructor)
  );
}

function typevar() {
  return m.map(
    text => ({ type: 'typevar', text, children: [] }),
    lowerWord()
  );
}

function constrainedType() {
  return m.map(
    ([text, child]) => ({ type: 'constrainedType', text, children: [child] }),
    m.join(
      lowerWord(),
      m.and(
        m.spaces(),
        type(WRAP_ALL)
      )
    )
  );
}

function wrappedConstrainedType() {
  return m.between(
    m.string('('),
    m.string(')'),
    m.delay(constrainedType)
  );
}

function fn() {
  return m.map(
    children => ({ type: 'function', text: '', children }),
    m.split(
      type(WRAP_FNS),
      m.string(' -> '),
      { min: 2 }
    )
  );
}

function wrappedFn() {
  return m.between(
    m.string('('),
    m.string(')'),
    m.delay(fn)
  );
}

function keyValue() {
  return m.map(
    ([keyText, valueType]) => ({type: 'member', text: keyText, children: [valueType]}),
    m.join(
      m.followedBy(
        m.stringOf(
          m.collect(
            m.noneOf(' ')
          )
        ),
        m.string(' :: ')
      ),
      type()
    )
  );
}

function record() {
  return m.map(
    children => ({ type: 'record', text: '', children }),
    m.between(
      m.string('{ '),
      m.string(' }'),
      m.split(
        m.delay(keyValue),
        m.string(', ')
      )
    )
  );
}

function method() {
  return m.map(
    ([thing, types]) => ({type: 'method', text: '', children: [thing, ...types]}),
    m.join(
      m.followedBy(
        m.delay(typeConstructor),
        m.string(' ~> ')
      ),
      m.split(
        type(WRAP_FNS),
        m.string(' -> '),
        { min: 1 }
      )
    )
  );
}

function uncurriedFunction() {
  return m.map(
    ([parameters, returnType]) => (
      {type: 'uncurriedFunction', text: '', children: [
        {type: 'parameters', text: '', children: parameters},
        returnType]}),
    m.join(
      m.between(
        m.string('('),
        m.string(')'),
        m.split(
          type(WRAP_FNS),
          m.string(', '),
          { min: 2 }
        )
      ),
      m.and(
        m.string(' -> '),
        type(WRAP_FNS)
      )
    )
  );
}

function wrappedUncurriedFn() {
  return m.between(
    m.string('('),
    m.string(')'),
    m.delay(uncurriedFunction)
  );
}

function type(wrap) {
  return m.or(
    m.delay(list),
    m.delay(wrap & WRAP_FN ? wrappedFn : fn),
    m.delay(wrap & WRAP_CONSTRAINED_TYPE ? wrappedConstrainedType : constrainedType),
    typevar(),
    m.delay(wrap & WRAP_TYPE_CONSTRUCTOR ? wrappedTypeConstructor : typeConstructor),
    m.delay(wrap & WRAP_UC_FN ? wrappedUncurriedFn : uncurriedFunction),
    m.delay(record)
  );
}

function parse() {
  return m.map(
    ([name, constraints, type]) => ({
      name,
      constraints: constraints || [],
      type
    }),
    m.join(
      m.followedBy(
        name(),
        m.string(' :: ')
      ),
      m.maybe(
        m.followedBy(
          classConstraints(),
          m.string(' => ')
        )
      ),
      type()
    )
  );
}

var HMP = {
  'name': name,
  'classConstraints': classConstraints,
  'list': list,
  'typeConstructor': typeConstructor,
  'typevar': typevar,
  'constrainedType': constrainedType,
  'fn': fn,
  'record': record,
  'method': method,
  'uncurriedFunction': uncurriedFunction,
  'type': type,
  'parse': parse,
};

// build functions from parsers
function prepExport(k, parser) {
  return function(input) {
    return m.parse(parser(), input);
  };
}

var k;
for (k in HMP) {
  HMP[k] = prepExport(k, HMP[k]);
}

module.exports = HMP;

