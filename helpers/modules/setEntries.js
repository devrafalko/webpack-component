const path = require('path');
const componentsDir = path.resolve('src','components');
const entries = require('./updateEntries')('ls').entries;
var entryObject = {};

if(!entries.length) {
  console.log("\x1b[31m", "At least one entry point component should be added." ,'\x1b[0m');
} else {
  entries.forEach(e => {
    var component = path.resolve(componentsDir,e,'controller.js');
    entryObject[e] = './' + path.relative('src', component).replace(/\\/g,'/');
  });
}
module.exports = entryObject;