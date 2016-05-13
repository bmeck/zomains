require('../index.js');
/////// HANDLER CODE
function handleError1() {
  console.log('HANDLER1');
  return false;
}
const child = new Zone({
  handleError: function () {
    console.log('handleError Fired');
  }
});
setTimeout(()=>{
  child.run(
    ()=> {
      throw Error('Not intercepted');
    }
  )
})