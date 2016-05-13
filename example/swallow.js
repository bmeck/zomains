require('../index.js');
const child = Zone.current.fork({
  handleError() {
    return true;
  }
});
child.runGuarded(() => {
  throw Error('Now handled?!');
});
