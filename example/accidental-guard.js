'use strict';
require('../');

// This example shows that error guarding behavior is always
// re-enabled upon *any* asynchronous task

const COMMON = require('./COMMON');
const EXPECTED = COMMON.expectUncaught();
const child = Zone.current.fork({
  handleError: COMMON.expectedCalls(1)
});
child.run(()=>{
  setTimeout(()=>{
    throw EXPECTED;
  });
});
