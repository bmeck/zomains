'use strict';
require('../');

const watching = new Map();
const expect = require('expect');
const expected = new Set();
const errors = [];
process.on('exit', () => {
  Array.from(watching.keys()).forEach((spy) => {
    const meta = watching.get(spy);
    const invocations = meta.invocations;
    try {
      expect(spy.calls.length).toEqual(invocations.length);
    }
    catch (e) {
      errors.push({
        error:e,
        expected:invocations,
        found:spy.calls,
        debug:spy.debug
      });
    }
    invocations.forEach((invocation, i) => {
      if (i >= spy.calls.length) return;
      expect(spy.calls[i]).toInclude(invocation);
    });
  });
  if (errors.length) {
    errors.forEach(e => console.dir(e, {colors:true, depth: null}));
    process.exit(1);
  }
});
process.on('uncaughtException', (e) => {
  if (expected.has(e) !== true) {
    throw e;
  }
  process.exit(0);
})
exports.checkZone = function (expected) {
  if (Zone.current !== expected) {
    const err = new Error('expected different Zone to be current');
    err.found = Zone.current;
    err.expected = expected;
    errors.push(err);
  }
}
exports.UncaughtException = function (msg) {
  const err = Error('Expected: ' + msg);
  expected.add(err);
  return err;
}
exports.expected = function (name, invocations, fn) {
  if (!Array.isArray(invocations)) {
    throw new Error('invocations must be an Array')
  }
  if (fn == null) fn = () => {};
  const spy = expect.createSpy();
  spy.debug = name;
  watching.set(spy, {invocations,fn})
  return function () {
    const ZONE = Zone.current;
    spy.apply(this, arguments);
    spy.calls[spy.calls.length-1].zone = ZONE;
    return fn.apply(this, arguments);
  }
}
exports.unexpected = (name) => {
  const spy = exports.expected(name, []);
};