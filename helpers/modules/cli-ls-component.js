const fs = require('fs');
const path = require('path');
const updateEntries = require('./updateEntries');
const r = updateEntries('ls');

if(!r.all.length){
	console.log("\x1b[33m","No component found.",'\x1b[0m');
} else {
	for(var i in r.all){
	var isEntry = r.entries.some(a=>a===r.all[i]) ? '[entry]':'';
	console.log("\x1b[32m",r.all[i],'\x1b[0m',isEntry);
	}
}
