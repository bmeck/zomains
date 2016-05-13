require('../index.js');
/////// HANDLER CODE
function handleError1() {
  console.log('HANDLER1');
  return false;
}
function handleError2() {
  console.log('HANDLER2');
  return false;
}

/////// LIBRARY CODE

const sql = {};
sql.addListener = function (f) {
  this.storedFunction = Zone.current.wrapGuarded(f);
};

sql.doStuff = function () {
  this.storedFunction();
};

/////// APP CODE

const rootZone = Zone.current;

const zone1 = rootZone.fork({
  handleError: handleError1
});
const zone2 = rootZone.fork({
  handleError: handleError2
});

zone1.run(function a() {
  sql.addListener(function b() {
    rootZone.run(function c() {
      throw new Error("boo");
    });
  });
});

zone2.run(function d() {
  setTimeout(function e() {
    sql.doStuff();
  }, 0);
});