'use strict';
require('../index.js');
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
    throw Error('thrown in handleError');
  }
});
child.runGuarded(() => {
  throw UnexpectedError('should have been overridden');
});
