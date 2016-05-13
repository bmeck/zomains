'use strict';
process.on('uncaughtException', (e) => {
  if (e.code) {
    console.error(e.stack);
    process.exit(e.code);
  }
  //console.error(e.stack);
  process.exit(0);
});
// This should be used only to signal that the Error was not expected
// to escape for the script that created it
exports.UnexpectedError = class UnexpectedError extends Error {
  constructor(msg) {
    super(msg);
    this.code = 1;
  }
}