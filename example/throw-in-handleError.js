'use strict';
require('../index.js');

// This example shows that errors inside of handleError escape
// the Zone

const path = require('path');
const COMMON = require('./COMMON');
const err = Error('unexpected');
const EXPECTED = COMMON.UncaughtException(path.basename(__filename));
const child = Zone.current.fork({
  handleError: COMMON.expected([{
    arguments: [err]
  }], _=>{throw EXPECTED;})
});
child.runGuarded(() => {
  throw err;
});
