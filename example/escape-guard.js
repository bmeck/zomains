'use strict';
require('../index.js');

// This example shows how to ensure no error guarding behavior
// prevents throw from reaching the host environment

const path = require('path');
const COMMON = require('./COMMON');
const EXPECTED = COMMON.UncaughtException(path.basename(__filename));
const caller = new Zone({
  handleError: COMMON.unexpected()
})
const child = new Zone({
  handleError: COMMON.expected([{arguments:[EXPECTED]}])
});
// our caller
caller.run(()=> {
  // start the escape
  child.run(()=>{
    setTimeout(()=>{
      throw EXPECTED;
    });
  });
});
