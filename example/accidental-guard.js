require('../index.js');
const child = Zone.current.fork({
  handleError() {
    console.log('handleError Fired');
  }
});
child.run(()=>{
  setTimeout(()=>{
    throw Error('Now handled?!');
  })
});
