require('../index.js');
const child = Zone.current.fork({
  handleError() {
    throw Error('thrown in handleError');
  }
});
child.runGuarded(() => {
  throw Error('Now handled?!');
});
