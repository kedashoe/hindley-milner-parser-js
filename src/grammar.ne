@builtin "whitespace.ne"
@include "util.ne"

@{% var pp = require('./post-process.js'); %}

type -> (
  fn |
  uncurriedFn |
  thunk |
  method |
  manyTypeConstructor |
  constrainedType |
  list |
  record |
  nullTypeConstructor |
  typevar ) {% pp.head2 %}

typeWrapFns -> (
  parens[fn] |
  parens[uncurriedFn] |
  parens[thunk] |
  manyTypeConstructor |
  constrainedType |
  list |
  record |
  nullTypeConstructor |
  typevar ) {% pp.head2 %}

typeWrapAll -> (
  parens[fn] |
  parens[uncurriedFn] |
  parens[thunk] |
  parens[manyTypeConstructor] |
  parens[constrainedType] |
  list |
  record |
  nullTypeConstructor |
  typevar ) {% pp.head2 %}

fn ->
  delim1[__ "->" __, typeWrapFns] {% pp.fn %}

uncurriedFn ->
  parens[delim1["," __, type]] __ "->" __ type {% pp.uncurriedFn %}

thunk ->
  after["()" __ "->" __, typeWrapFns] {% pp.thunk %}

method ->
  around[__ "~>" __, typeConstructor, delim0[__ "->" __, typeWrapFns]] {% pp.method %}

constrainedType ->
  lword after[__, typeWrapAll]:+ {% pp.constrainedType %}

nullTypeConstructor ->
  ufirst {% pp.nullTypeConstructor %}

manyTypeConstructor ->
  ufirst after[__, typeWrapAll]:+ {% pp.manyTypeConstructor %}

typeConstructor -> (
  nullTypeConstructor |
  manyTypeConstructor ) {% pp.head2 %}

typevar ->
  lword {% pp.typevar %}

list ->
  brackets[type] {% pp.list %}

keyVal ->
  word __ "::" __ type {% pp.keyVal %}

record ->
  between["{" __, __ "}", delim0["," __, keyVal]] {% pp.record %}

name ->
  [^ \t\r\n\v\f]:+ {% pp.name %}

classConstraint ->
  around[__, ufirst, lword] {% pp.classConstraint %}

classConstraints ->
  classConstraint {% pp.classConstraintsOne %} |
  parens[delim1["," __, classConstraint]] {% pp.classConstraintsMany %}

parse ->
  name (__ "::" __) before[__ "=>" __, classConstraints]:? type {% pp.parse %}

