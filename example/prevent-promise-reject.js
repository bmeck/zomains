'use strict';
require('../');

// This example shows that promise reaction jobs can change from a
// .catch to a .then

// SHOULD this instead return a never resolving Promise instead of undefined?

const COMMON = require('./COMMON');
const rejection = Error('unexpected');
const child = Zone.current.fork({
  handleError: COMMON.expected([{arguments:[rejection]}], _ => true)
});
child.run(()=>{
  Promise.resolve(0)
    .then(
      COMMON.expected([{
        zone: child,
        arguments: [0]
      }],()=>{throw rejection;})
    )
    .then(
      COMMON.expected([{
        zone: child,
        arguments: [undefined]
      }],_=>{}),
      COMMON.unexpected()
    );
});
