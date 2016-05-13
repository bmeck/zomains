'use strict';
require('../');
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
  }
});
child.run(()=>{
  setTimeout(()=>{
    throw Error('Now handled?!');
  })
});
