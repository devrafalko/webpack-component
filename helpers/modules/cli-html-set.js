const fs = require('fs');
const path = require('path');
const moduleDir = path.resolve('helpers','modules');
const entryJSON = path.resolve(moduleDir,'html-settings.json');
const updateInitPage = require('./updateInitPage');
const updateEntries = require('./updateEntries');
const entries = updateEntries('ls').entries;

var htmlSettings = require('./htmlSettings');

setNewHTML();

  function setNewHTML(){
    const a = cliArgs();
    for(let i in a){
      if(i==='init'){
        updateInitPage(a[i]);
        continue;
      }
      htmlSettings[i] = a[i];
    }
    try{
      fs.writeFileSync(entryJSON, JSON.stringify(htmlSettings));
      } catch(err){
        console.log("\x1b[31m", "Couldn't update html settings." ,'\x1b[0m');
        }
  }

  function cliArgs(){
    var getArgs = JSON.parse(process.env.npm_config_argv).original.slice(2);
    var validProp = /^--?(title|author|description|keywords|init)$/;
    var validVal = /^--?.+$/;
    var map = {};
    var logMsg =	'\x1b[31m Invalid arguments.\n\n\x1b[0m ' +
                  'Use: \x1b[36mnpm run html-set <arg> <value>\x1b[0m ' +
                  'where \x1b[36m<arg>\x1b[0m is one of:\n ' +
                  '\x1b[36m--title --author --description --keywords --init\x1b[0m\n\n';

    for(var i=0;i<getArgs.length;i++)	{
      let testProp = validProp.exec(getArgs[i]);
      let testVal = getArgs[i+1] ? validVal.exec(getArgs[i+1]):true;
      if(testProp){
        var newVal = !testVal ? getArgs[i+1]:"";
        if(testProp[1]==='init'&&newVal===''){
          console.log('\x1b[33m The --init argument should indicate one of existing entry points. The empty value was ignored.\x1b[0m ');
          continue;
        }
        map[testProp[1]] = newVal;
      }
    }
    var props = Object.getOwnPropertyNames(map);
    if(props.length){
      for(var i in props){
        if(props[i]==='init') continue;
        console.log("\x1b[32m The '" + props[i] + "' property set to '" + map[props[i]] + "'.\x1b[0m ");	
      }
      return map;
      } else {
        console.log(logMsg);
        return null;
        }
  }