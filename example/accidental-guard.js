require('../index.js');
/////// HANDLER CODE
const child = Zone.current.fork({
  handleError: function () {
    console.log('handleError Fired');
  }
});
child.run(
  ()=>setTimeout(()=>{
    throw Error('Now handled?!');
  })
)
