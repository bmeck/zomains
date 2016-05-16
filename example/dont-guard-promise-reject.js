'use strict';
require('../');

// This example shows that promise reaction jobs do not use guarding behavior

const COMMON = require('./COMMON');
const rejection = Error('unexpected');
const child = Zone.current.fork({
  handleError: COMMON.unexpected('handleError')
});
child.run(()=>{
  COMMON.checkZone(child);
  Promise.resolve(0)
    .then(
      COMMON.expected('reactionHandler', [{
        zone: child,
        arguments: [0]
      }], function thrower() {throw rejection;})
    )
    .then(
      COMMON.unexpected('then'),
      COMMON.expected('catch', [{
        zone: child,
        arguments: [rejection]
      }])
    );
});
