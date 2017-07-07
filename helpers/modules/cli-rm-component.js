const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const updateEntries = require('./updateEntries');
rmComponent();

	function rmComponent(){
		var prompt = require('prompt');
		var componentsPath = path.resolve('src','components');
		var args = JSON.parse(process.env.npm_config_argv).original.slice(2);
		if(!args.length){
			console.log("\x1b[31m", "Define the name of component." ,'\x1b[0m');
			return;
		} else {
			var componentName = args[0];
			var componentPath = path.resolve(componentsPath,componentName);
			var entryEx = updateEntries('rm',componentName);
			var compEx = fs.existsSync(componentPath);

			if(entryEx.done||compEx){
				var promptOptions = {
					properties: {
						confirm: {
							pattern: /^(y(es)?|n(o)?)$/gi,
							description: "Do you really want to remove '" + componentName + "' component?",
							message: 'Type yes/no',
							required: true,
							default: 'no'
						}
					}
				};			

				prompt.start();
				prompt.message = '';
				prompt.delimiter = '';
				prompt.colors = false;
				prompt.get(promptOptions, function (err, result){
					if(result.confirm.match(/y(es)?/i)){
						if(entryEx.done){
								console.log("\x1b[32m", "The entry point of component '" + componentName + "' removed." ,'\x1b[0m');	
						}
						if(compEx){
							fse.removeSync(componentPath);
							console.log("\x1b[32m", "The component '" + componentName + "' removed." ,'\x1b[0m');	
						}
					} else {
						console.log('ABORT');
						return;
					}
				});			
			} else {
				console.log("\x1b[31m", "Couldn't found the '" + componentName + "' component." ,'\x1b[0m');
				return;
			}
		}
	}