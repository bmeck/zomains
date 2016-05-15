'use strict';
require('../index.js');

// This example shows that errors inside of handleError escape
// the Zone

const COMMON = require('./COMMON');
const EXPECTED = COMMON.expectUncaught('thrown in handleError');
const child = Zone.current.fork({
  handleError: COMMON.expectedCalls(1, _=>{throw EXPECTED})
});
child.runGuarded(() => {
  throw Error('unexpected');
});
