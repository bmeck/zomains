'use strict';
require('../index.js');

// This example shows error propagation stopping

const COMMON = require('./COMMON');
const child = new Zone({
  handleError: COMMON.expectedCalls(1, _ => true)
});
child.runGuarded(() => {
  throw Error('unexpected');
});
