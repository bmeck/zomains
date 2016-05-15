'use strict';
require('../');

const watching = new Map();
const expect = require('expect');
const expected = new Set();
process.on('exit', () => {
  const errors = [];
  Array.from(watching.keys()).forEach((spy) => {
    const invocations = watching.get(spy);
    try {
      expect(spy.calls.length).toEqual(invocations.length);
    }
    catch (e) {
      errors.push(e);
    }
    invocations.forEach((invocation, i) => {
      expect(spy.calls[i]).toInclude(invocation);
    });
  });
  if (errors.length) {
    errors.forEach(e => console.error(e));
    process.exit(1);
  }
});
process.on('uncaughtException', (e) => {
  if (expected.has(e) !== true) {
    throw e;
  }
  process.exit(0);
})
exports.UncaughtException = function (msg) {
  const err = Error('Expected: ' + msg);
  expected.add(err);
  return err;
}
exports.expected = function (invocations, fn) {
  if (!Array.isArray(invocations)) {
    throw new Error('invocations must be an Array')
  }
  if (fn == null) fn = function () {};
  const spy = expect.createSpy();
  watching.set(spy, invocations)
  return function () {
    const ZONE = Zone.current;
    spy.apply(this, arguments);
    spy.calls[spy.calls.length-1].zone = ZONE;
    return fn.apply(this, arguments);
  }
}
exports.unexpected = () => exports.expected([]);