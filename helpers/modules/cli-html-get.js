const htmlSettings = require('./htmlSettings');

cliArgs();

  function cliArgs(){
    var getArgs = JSON.parse(process.env.npm_config_argv).original.slice(2);
    if(!getArgs.length) getArgs = Object.getOwnPropertyNames(htmlSettings).slice();
    for(let i in getArgs){
      if(typeof htmlSettings[getArgs[i]]==='string') console.log('\x1b[35m' + getArgs[i] + ':\x1b[0m ' + htmlSettings[getArgs[i]]);
    }
  }