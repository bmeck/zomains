'use strict';
require('../index.js');

// This example shows how to ensure no error guarding behavior
// prevents throw from reaching the host environment

const fs = require('fs');
const path = require('path');
const COMMON = require('./COMMON');
const EXPECTED = COMMON.UncaughtException(path.basename(__filename));
const child = new Zone({
  handleError: COMMON.expected('handleError', [{arguments:[EXPECTED]}])
});
child.run(() => {
  COMMON.checkZone(child);
  function cb(err) {
    COMMON.checkZone(child);
    throw EXPECTED;
  }
  fs.stat(path.join(__filename, 'invalid'), cb);
});
