'use strict';
require('../');

// This example shows that promise reaction jobs can change from a
// .catch to a .then

const COMMON = require('./COMMON');
const child = Zone.current.fork({
  handleError: COMMON.expectedCalls(1, _ => true)
});
child.run(()=>{
  Promise.resolve(0)
    .then(
      COMMON.expectedCalls(1,()=>{throw Error('unexpected');})
    )
    .then(
      COMMON.expectedCalls(1,_=>{}),
      COMMON.unexpected()
    );
});