'use strict';
require('../');

// This example shows that error guarding behavior is always
// re-enabled upon *any* asynchronous task

const path = require('path');
const COMMON = require('./COMMON');
const EXPECTED = COMMON.expectUncaught(path.basename(__filename));
const child = Zone.current.fork({
  handleError: COMMON.expectedCalls(1)
});
child.run(()=>{
  setTimeout(()=>{
    throw EXPECTED;
  });
});
