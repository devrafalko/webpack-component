const fs = require('fs');
const path = require('path');
const moduleDir = path.resolve('helpers','modules');
const entryJSON = path.resolve(moduleDir,'entry-points.json');
const componentsPath = path.resolve('src','components');
const updateInitPage = require('./updateInitPage');

module.exports = function (action,component){
  var components = getComponents();
  var entryContent = getJSONcontent(entryJSON);
  return runAction();
	
    function getJSONcontent(file){
      var stringContent = fs.existsSync(file) ? fs.readFileSync(file,'utf8'):[];
      var parsedContent = typeof stringContent==="string" && stringContent.length ? JSON.parse(stringContent):[];
      return pruneContent(parsedContent);
    }
			
    function pruneContent(parsedContent){
      if(!parsedContent.length) {
        return parsedContent;
      } else {
        return parsedContent.filter(function(item) {
          return components.all.some(function(f){
            return f===item;
          });
        }
        );
      }
    }
			
    function getComponents(){
      var c = {all:[]};
      fs.readdirSync(componentsPath).forEach(function(file){
        var filePath = path.resolve(componentsPath,file);
        if(fs.lstatSync(filePath).isDirectory()) c.all.push(file);
      });
      return c;
    }

    function runAction(){
      var done = false;
      switch(action){
        case 'add':
          if(!entryContent.some(a=>a===component)){
            entryContent.push(component);
            done = true;
          }
          break;
        case 'rm':
          var index = entryContent.indexOf(component);
          if(index>=0) {
            entryContent.splice(index,1);
            done = true;
          }
          break;
        case 'ls':
          done = true;
          break;
      }
      updateEntries();
      return {all:components.all,entries:entryContent,done:done};
    }

    function updateEntries(){
      try{
        fs.writeFileSync(entryJSON, JSON.stringify(entryContent));
        updateInitPage();
      } catch(err){
        console.log("\x1b[31m", "Couldn't update the entry points list." ,'\x1b[0m');
      }
    }
};