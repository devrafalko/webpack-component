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
			if(a[i].prop==='init'){
				updateInitPage(a[i].val);
				continue;
			}
			htmlSettings[a[i].prop] = a[i].val;
		}
		try{
			fs.writeFileSync(entryJSON, JSON.stringify(htmlSettings));
			} catch(err){
				console.log("\x1b[31m", "Couldn't update html settings." ,'\x1b[0m');
				}
	}
	
	function cliArgs(){
		var getArgs = JSON.parse(process.env.npm_config_argv).original.slice(2);
		var valid = /^--?(title|author|description|keywords|init)$/;
		var map = [];
		var logMsg =	'\x1b[31m Invalid arguments.\n\n\x1b[0m ' +
									'Use: \x1b[36mnpm run html-set <arg> <value>\x1b[0m ' +
									'where \x1b[36m<arg>\x1b[0m is one of:\n ' +
									'\x1b[36m--title --author --description --keywords --init\x1b[0m\n\n';
		for(var i=0;i<getArgs.length;i=i+2){
			let testProp = valid.exec(getArgs[i]);
			let testVal = valid.exec(getArgs[i+1]);
			if(testProp && !testVal) {
				map.push({prop:testProp[1],val:getArgs[i+1]});
				} else {
					console.log(logMsg);
					return null;
					}
		}
		if(map.length){
			return map;
			} else {
				return null;
				console.log(logMsg);
				}
	}