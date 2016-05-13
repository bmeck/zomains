'use strict';
require('../index.js');
const UnexpectedError = require('./COMMON').UnexpectedError;
let tocall = 2;
process.on('exit', ()=>{
  if (tocall !== 0) {
    process.reallyExit(1);
  }
});
/////// HANDLER CODE
function handleError1() {
  tocall--;
  return false;
}
function handleError2() {
  tocall--;
  return false;
}

/////// LIBRARY CODE

const sql = {};
sql.addListener = function (f) {
  this.storedFunction = Zone.current.wrapGuarded(f);
};

sql.doStuff = function () {
  this.storedFunction();
};

/////// APP CODE

const rootZone = Zone.current;

const zone1 = rootZone.fork({
  handleError: handleError1
});
const zone2 = rootZone.fork({
  handleError: handleError2
});

zone1.run(function a() {
  sql.addListener(function b() {
    rootZone.run(function c() {
      throw new Error("boo");
    });
  });
});

zone2.run(function d() {
  setTimeout(function e() {
    sql.doStuff();
  }, 0);
});