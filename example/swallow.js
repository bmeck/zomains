'use strict';
require('../index.js');

// This example shows errors being swallowed

const UnexpectedError = require('./COMMON').UnexpectedError;
let tocall = 1;
process.on('exit', ()=>{
  if (tocall !== 0) {
    process.reallyExit(1);
  }
});
const child = Zone.current.fork({
  handleError() {
    tocall--;
    return true;
  }
});
child.runGuarded(() => {
  throw UnexpectedError('should have been swallowed');
});
