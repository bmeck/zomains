'use strict';
require('../');

// This example shows that error guarding behavior is always
// re-enabled upon *any* asynchronous task

const path = require('path');
const COMMON = require('./COMMON');
const EXPECTED = COMMON.UncaughtException(path.basename(__filename));
const child = Zone.current.fork({
  handleError: COMMON.expected('handleError', [{arguments:[EXPECTED]}])
});
child.run(()=>{
  COMMON.checkZone(child);
  setTimeout(()=>{
    COMMON.checkZone(child);
    throw EXPECTED;
  });
});
