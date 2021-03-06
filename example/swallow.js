'use strict';
require('../index.js');

// This example shows error propagation stopping

const COMMON = require('./COMMON');
const err = Error('unexpected');
const child = new Zone({
  handleError: COMMON.expected('handleError', [{arguments:[err]}], _ => true)
});
child.runGuarded(() => {
  COMMON.checkZone(child);
  throw err;
});
