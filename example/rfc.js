'use strict';
require('../index.js');

// This example is taken from https://github.com/domenic/zones/issues/9

/////// HANDLER CODE
const path = require('path');
const COMMON = require('./COMMON');
const EXPECTED = COMMON.expectUncaught('boo');
const handleError1 = COMMON.expectedCalls(1);
const handleError2 = COMMON.expectedCalls(1);

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
      throw EXPECTED;
    });
  });
});

zone2.run(function d() {
  setTimeout(function e() {
    sql.doStuff();
  }, 0);
});
