'use strict';
require('../index.js');

// This example is taken from https://github.com/domenic/zones/issues/9

/////// HANDLER CODE
const path = require('path');
const COMMON = require('./COMMON');
const EXPECTED = COMMON.UncaughtException('boo');
const handleError1 = COMMON.expected('handleError1', [{arguments:[EXPECTED]}]);
const handleError2 = COMMON.expected('handleError2', [{arguments:[EXPECTED]}]);

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

zone1.run(function a() {//a will not have zone1 guard
  sql.addListener(function b() {//b will have zone1 guard
    rootZone.run(function c() {//c will not have rootZone guard
      throw EXPECTED;
    });
  });
});

zone2.run(function d() {//d will not have zone1 guard
  setTimeout(function e() {//e will have zone2 guard
    sql.doStuff();
  }, 0);
});
