require('../index.js');
/////// HANDLER CODE
const child = Zone.current.fork({
  handleError: function () {
    return true;
  }
});
child.runGuarded(() => {
  throw Error('Now handled?!');
})
