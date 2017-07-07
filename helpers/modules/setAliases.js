const fs = require('fs');
const path = require('path');
const updateEntries = require('./updateEntries');
const components = updateEntries('ls').all;
const componentsDir = path.resolve('src','components');
const assetsDir = path.resolve('src','assets');
const prefix = '@';
function generateAliases(){
	var aliases = {};
	for(var i in components){
		aliases[prefix+components[i]] = path.resolve(componentsDir,components[i]);
	}

	fs.readdirSync(assetsDir).forEach(function(file){
		var filePath = path.resolve(assetsDir,file);
		var capitalize = file.replace(/^./,a=>a.toUpperCase());
		if(fs.lstatSync(filePath).isDirectory()) aliases[prefix+capitalize] = filePath;
	});
	
	aliases['Components'] = componentsDir;
	aliases['Modules'] = path.resolve('helpers','modules');
	aliases['Templates'] = path.resolve('helpers','templates');
	return aliases;
}

module.exports = generateAliases();