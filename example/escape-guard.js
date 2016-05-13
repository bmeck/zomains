'use strict';
require('../index.js');
const UnexpectedError = require('./COMMON').UnexpectedError;
let tocall = 0;
process.on('exit', ()=>{
  if (tocall !== 0) {
    process.reallyExit(1);
  }
});
const child = new Zone({
  handleError() {
    tocall--;
    process.exit(1);
  }
});
setTimeout(()=>{
  child.run(()=> {
    throw Error('Not intercepted');
  })
});