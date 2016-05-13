require('../index.js');
/////// HANDLER CODE
function handleError1() {
  console.log('HANDLER1');
  return false;
}
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