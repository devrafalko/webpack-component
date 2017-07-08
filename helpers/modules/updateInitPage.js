const fs = require('fs');
const path = require('path');
const moduleDir = path.resolve('helpers','modules');
const htmlJSON = path.resolve(moduleDir,'html-settings.json');
const entryJSON = path.resolve(moduleDir,'entry-points.json');
var htmlSettings = require('./htmlSettings');

module.exports = function(newInit){
	var entries = getJSONcontent(entryJSON);

	if(typeof newInit === 'string'){
		if(entries.some(a=>a===newInit)){
			setNewInit(newInit);
			console.log("\x1b[32m The 'init' property set to '" + newInit + "'.\x1b[0m ");	

		} else {
			console.log("\x1b[33m", "The '" + newInit + "' entry point does not exist. Add '" + newInit + "' entry-point component first." ,'\x1b[0m');
		}
	} else {
		if(!entries.some(a=>a===htmlSettings.init)){
			if(entries.some(a=>a==='index')) {
				setNewInit('index');
				} else {
					setNewInit(entries.length ? entries[0]:"");
					}
		}
	}
};

	function setNewInit(newInit){
		try {
			htmlSettings.init = newInit;
			fs.writeFileSync(htmlJSON, JSON.stringify(htmlSettings));
			} catch(err){
				console.log("\x1b[31m", "Couldn't update html settings." ,'\x1b[0m');
				}
	}
	
	function getJSONcontent(file){
		if(fs.existsSync(file)){
			return JSON.parse(fs.readFileSync(file,'utf8'));
			} else {
				console.log("\x1b[31m", "Couldn't get the entry points list." ,'\x1b[0m');
				return [];
				}
	}
