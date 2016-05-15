'use strict';
const watching = new Map();
const expect = require('expect');
const expected = new Set();
process.on('exit', () => {
  const errors = [];
  Array.from(watching.keys()).forEach((k) => {
    const test = watching.get(k);
    try {
      expect(test.spy.calls.length).toEqual(test.calls);
    }
    catch (e) {
      errors.push(e);
    }
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
exports.expectUncaught = function (msg) {
  const err = Error('Expected: ' + msg);
  expected.add(err);
  return err;
}
exports.expectedCalls = function (calls, fn) {
  if (fn == null) fn = function () {};
  const spy = expect.createSpy();
  watching.set(spy, {
    spy: spy,
    calls: calls
  })
  return function () {
    spy.apply(this, arguments);
    return fn.apply(this, arguments);
  }
}
exports.unexpected = () => exports.expectedCalls(0);