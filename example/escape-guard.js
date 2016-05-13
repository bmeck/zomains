require('../index.js');
/////// HANDLER CODE
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