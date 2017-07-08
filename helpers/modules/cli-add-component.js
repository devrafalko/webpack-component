const fs = require('fs');
const path = require('path');

const assetsDirectory = 'assets';
const componentsPath = path.resolve('src','components');
const templatesPath = path.resolve('helpers','templates');
const moduleDir = path.resolve('helpers','modules');
const defaultComponentName = 'new-component';
const updateEntries = require('./updateEntries');
const cliArgs = findCli();

createComponent();

function createComponent(){
	createRootDir();
	
	function createRootDir(){
		if (!fs.existsSync(componentsPath)){
			fs.mkdir(componentsPath,function(err){
				if(err) {
					console.log("\x1b[31m", "Couldn't create 'components' directory." ,'\x1b[0m');
				} else {
					testComponentDirectory();
				}
			});
		} else {
			testComponentDirectory();
		}
	}
	
	function testComponentDirectory(){
		if(!cliArgs) return;
		var newComponentName = cliArgs.name;
		if(newComponentName){
			var newComponentPath = path.join(componentsPath,newComponentName);
			if (fs.existsSync(newComponentPath)){
					console.log("\x1b[31m", "The component '" + newComponentName + "' already exists. Use another name." ,'\x1b[0m');
			}	else {
					createComponentDirectory(newComponentPath,newComponentName);
			}

		} else {
			var iter = 1;
			while(true){
				var newComponentName = defaultComponentName+'-'+iter;
				var newComponentPath = path.join(componentsPath,newComponentName);
				if (!fs.existsSync(newComponentPath)){
					createComponentDirectory(newComponentPath,newComponentName);
					break;
				} else {
					iter++;
				}
			}
		}
		
		function createComponentDirectory(newComponentPath,newComponentName){
			fs.mkdir(newComponentPath,function(err){
				if(err) {
					console.log("\x1b[31m", "Couldn't create '" + newComponentName + "' directory." ,'\x1b[0m');
				} else {
					console.log("\x1b[32m", "The component '" + newComponentName + "' added." ,'\x1b[0m');	
					createComponentContent(newComponentPath,newComponentName);
					if(cliArgs.entry) updateEntries('add',cliArgs.name);
				}
			});
		}
	}
}

function createComponentContent(newComponentPath,newComponentName){
	createAssetsDir();
	
	function createAssetsDir(){
		fs.mkdir(path.join(newComponentPath,assetsDirectory),function(err){
			if(err){
				console.log("\x1b[31m", "Couldn't create 'assets' directoryeee." ,'\x1b[0m');
			} else {
				console.log("\x1b[32m", "'assets' directory added.",'\x1b[0m');
				createComponentFiles();
			}
		});
	}
	
	function createComponentFiles(){
		var newComponentArgs = cliArgs.args;
		const htmlData = require('./htmlSettings');
		htmlData['component-name'] = newComponentName;

		if(cliArgs.entry && !cliArgs.args.some(a=>a==='c')) newComponentArgs.push('c');
		
		var files = {
			styles:{cli:'v',fileName:'styles.scss',exp:true,variable:'styles'},
			template:{cli:'v',fileName:cliArgs.entry?'entry.html':'template.html',exp:true,variable:'template'},
			controller:{cli:'c',fileName:'controller.js',exp:false,variable:'controller'},
			data:{cli:'m',fileName:assetsDirectory+'/data.json',exp:false},
			test:{cli:'t',fileName:'test.js',exp:false},
			testDom:{cli:'t',fileName:'test-dom.js',exp:false}
		};
		
		for(var prop in files){
			if(newComponentArgs.some && newComponentArgs.some(a=>a===files[prop].cli)){
				var filePath = path.join(newComponentPath,files[prop].fileName);
				createMvcFiles(filePath,files[prop].fileName);				
			}
		}

		function createMvcFiles(filePath,fileName){
			fs.readFile(path.join(templatesPath,fileName),'utf8',function(err,data){
				var placeholders = /\{{2}(component-name|title|author|description|keywords)\}{2}/gim;
				var newContent = err ? '':data.replace(placeholders,(a,b) => htmlData[b]);
				fs.appendFile(filePath,newContent,function(err){
					if(err) console.log('\x1b[31m',"Couldn't create " + fileName + " file",'\x1b[0m');
					if(!err) console.log('\x1b[32m',"'" + fileName + "' file added.",'\x1b[0m');
				});
			});
		}
	}
}

function findCli(){
	var args = JSON.parse(process.env.npm_config_argv).original.slice(2);
	var dones = [];
	
	for(var i in args){
		var test = /^--?([A-z0-9]*)$/.exec(args[i]);
		if(test && test[1]){
			dones.push({name:test[1],args:[]});
		} else {
			if(!dones.length){
				console.log('\x1b[31m',"Invalid arguments.",'\x1b[0m');
				return null;
			} else {
				dones[dones.length-1].args.push(args[i]);
			}
		}
	}
	return {
		name: setName(),
		args: setArgs(),
		entry: setEntry()
	};

		function setName(){
			var p = dones.findIndex((a)=> a.name === 'name');
			return p>=0 ? dones[p].args.length && typeof dones[p].args[0] === 'string' ? dones[p].args[0]:false:false;
		}

		function setArgs(){
			var p = dones.findIndex((a)=> a.name === 'args');
			return p>=0 ? dones[p].args.filter((a)=> a.match(/^[mvct]$/)):['m','v','c','t'];
		}

		function setEntry(){
			var p = dones.findIndex((a)=> a.name === 'entry');
			return p>=0 ? dones[p].args.length ? dones[p].args[0].match(/^(null|false|0|undefined)$/)===null ? true:false:true:false;
		}
}