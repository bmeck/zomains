'use strict';
require('../');

// This example shows that promise reaction jobs can change from a
// .catch to a .then

const UnexpectedError = require('./COMMON').UnexpectedError;
let tocall = 3;
process.on('exit', ()=>{
  if (tocall !== 0) {
    process.reallyExit(1);
  }
});
const child = Zone.current.fork({
  handleError(e) {
    tocall--;
    return true;
  }
});
child.run(()=>{
  Promise.resolve(0)
    .then(()=>{
      tocall--;
      throw 1;
    })
    .then((v)=>{
      // this is called because promise did not reject
      console.log();
      tocall--;
    },(e)=>{
      // this should never be called
      tocall=-1;
    });
});