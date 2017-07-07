const path = require('path');
const fs = require('fs');
const updateEntries = require('./updateEntries');
const entries = updateEntries('ls').entries;
const templatesPath = path.resolve('helpers','templates');
const HtmlPlugin = require('html-webpack-plugin');
const BrowserPlugin = require('open-browser-webpack-plugin');

const nodeEnv = process.env.NODE_ENV;
const negProduction = nodeEnv!=='built'&&nodeEnv!=='built-p';

module.exports = function (html,devOptions){
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
		},html)));
	}
	if(negProduction){
		arr.push(new BrowserPlugin({url: devOptions.url()}));
	}
	
	return arr;

		function HtmlConfig(o,html){
			this.template = o.template;
			this.filename = o.name+'.html';
			this.chunks = [o.name,'commons','manifest'];
			this.inject = 'head';
			this.favicon = o.icon;
			this.title = html.title;
			this.author = html.author;
			this.description = html.description;
			this.keywords = html.keywords;
		};	

		function setTemplate(name){
			const tmpl = path.resolve(templatesPath,name+'.html');
			const def = path.resolve(templatesPath,'index.html');
			var t = fs.existsSync(tmpl) ? tmpl:fs.existsSync(def) ? def:false;
			if(!t) console.log("\x1b[31m", "Couldn't find any html template file for '" + name + "' entry." ,'\x1b[0m');
			return t;
		}

		function setIcon(name){
			const tmpl = findFile(name);
			const def = findFile('favicon');
			var t = tmpl || def;
			if(!t) console.log("\x1b[31m", "Couldn't find any icon for '" + name + "' entry. Probably you removed `favicon.png` from `templates` directory." ,'\x1b[0m');
			return t;
		}

			function findFile(name){
				var ext = ['.png','.ico'];
				var ret = false;
				for(var i in ext){
					let p = path.resolve(templatesPath,name+ext[i]);
					if(fs.existsSync(p)){
						ret = p;
						break;
					}
				}
				return ret;
			}
};