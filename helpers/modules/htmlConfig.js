const path = require('path');
const fs = require('fs');
const updateEntries = require('./updateEntries');
const entries = updateEntries('ls').entries;
const templatesPath = path.resolve('helpers','templates');
const componentsPath = path.resolve('src','components');
const HtmlPlugin = require('html-webpack-plugin');
const BrowserPlugin = require('open-browser-webpack-plugin');

const nodeEnv = process.env.NODE_ENV;
const negProduction = nodeEnv!=='built'&&nodeEnv!=='built-p';

module.exports = function (devOptions){
	var arr = [];
	for(let i in entries){
		let entryName = entries[i];
		let templatePath = setTemplate(entryName);
		let iconPath = setIcon(entryName);
		if(!templatePath||!iconPath) return;
		arr.push(new HtmlPlugin(new HtmlConfig({
			name:entryName,
			template:templatePath,
			icon:iconPath
		})));
	}
	if(negProduction){
		arr.push(new BrowserPlugin({url: devOptions.url()}));
	}
	
	return arr;

		function HtmlConfig(o){
			this.template = o.template;
			this.filename = o.name+'.html';
			this.chunks = [o.name,'commons','manifest'];
			this.inject = 'head';
			this.favicon = o.icon;
		};

		function setTemplate(name){
			const tmpl = path.resolve(componentsPath,name,'entry.html');
			var t = fs.existsSync(tmpl) ? tmpl:false;
			if(!t) console.log("\x1b[31m", "Couldn't find entry.html for '" + name + "' entry-point component." ,'\x1b[0m');
			return t;
		}

		function setIcon(name){
			const userFavicon = findFile('favicon',path.resolve(componentsPath,name));
			if(userFavicon){
				fs.renameSync(userFavicon, path.resolve(path.dirname(userFavicon),'favicon_'+name+path.extname(userFavicon)));
			}
			const userIcon = findFile('favicon_'+name,path.resolve(componentsPath,name));
			const defaultIcon = findFile('favicon',templatesPath);
			var usedIcon = userIcon || defaultIcon;
			if(!usedIcon) console.log("\x1b[31m", "Couldn't find any icon for '" + name + "' entry. Probably you removed `favicon.png` from `templates` directory." ,'\x1b[0m');
			return usedIcon;
		}

			function findFile(name,iconDir){
				var ext = ['.png','.ico'];
				var ret = false;
				for(var i in ext){
					let p = path.resolve(iconDir,name+ext[i]);
					if(fs.existsSync(p)){
						ret = p;
						break;
					}
				}
				return ret;
			}
};