'use strict';
require('../index.js');

// This example shows how to ensure no error guarding behavior
// prevents throw from reaching the host environment

const UnexpectedError = require('./COMMON').UnexpectedError;
let tocall = 1;
process.on('exit', ()=>{
  if (tocall !== 0) {
    process.reallyExit(1);
  }
});
const child = new Zone({
  handleError() {
    tocall--;
  }
});
child.run(()=>{
  setTimeout(()=>{
    child.run(()=> {
      throw Error('Not intercepted');
    })
  });
});
