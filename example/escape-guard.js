'use strict';
require('../index.js');

// This example shows how to ensure no error guarding behavior
// prevents throw from reaching the host environment

const COMMON = require('./COMMON');
const EXPECTED = COMMON.expectUncaught();
const caller = new Zone({
  handleError: COMMON.unexpected()
})
const child = new Zone({
  handleError: COMMON.expectedCalls(1)
});
// our caller
caller.run(()=> {
  // start the escape
  child.run(()=>{
    setTimeout(()=>{
      child.run(()=> {
        throw EXPECTED;
      })
    });
  });
});