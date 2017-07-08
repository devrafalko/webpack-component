const fs = require('fs');
const path = require('path');
const moduleDir = path.resolve('helpers','modules');
const entryJSON = path.resolve(moduleDir,'html-settings.json');

module.exports = getJSONcontent(entryJSON);

  function getJSONcontent(file){
    if(fs.existsSync(file)){
      return JSON.parse(fs.readFileSync(file,'utf8'));
    } else {
      console.log("\x1b[31m", "Couldn't get html settings." ,'\x1b[0m');
      return {};
    }
  }