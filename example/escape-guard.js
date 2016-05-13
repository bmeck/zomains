require('../index.js');
const child = new Zone({
  handleError() {
    console.log('handleError Fired');
  }
});
setTimeout(()=>{
  child.run(()=> {
    throw Error('Not intercepted');
  })
})