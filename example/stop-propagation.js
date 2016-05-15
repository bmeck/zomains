'use strict';
require('../index.js');

// This example shows error propagation stopping

const COMMON = require('./COMMON');
const parent = Zone.current.fork({
  handleError: COMMON.unexpected()
});
const child = parent.fork({
  handleError: COMMON.expectedCalls(1, _ => true)
});
child.runGuarded(() => {
  throw Error('unexpected');
});
