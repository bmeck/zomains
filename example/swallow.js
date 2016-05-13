require('../index.js');
/////// HANDLER CODE
const child = Zone.current.fork({
  handleError() {
    return true;
  }
});
child.runGuarded(() => {
  throw Error('Now handled?!');
})
