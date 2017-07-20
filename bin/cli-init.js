module.exports = validateArguments;

const path = require('path');
const inquirer = require('inquirer');
const scriptPath = __dirname;
const currentPath = process.cwd();
var installPath = currentPath;

function validateArguments(args){
  if(Array.isArray(args)){
    if(args.length) installPath = args[0];
  } else {
    var p = args['-p']||args['--path'];
    if(p&&p.length) {
      installPath = p[0];
    } else {
        console.log("\x1b[31mInvalid arguments.\x1b[0m\nUse:\n  wbc init\n  wbc init <path>\n  wbc init -p <path>\n  wbc init --path <path>");
      return;
    }
  }
  getFormData();
}

function copyFiles(){
  //path.resolve(currentPath,installPath)
}

function getFormData(){
//  inquirer.prompt([{type:'input',name:'a',message:'Pierogi?'}]).then(function (answers) {
//      // Use user feedback for... whatever!! 
//      console.log(answers);
//  });    
}

function setFormData(){
  //run cli-set z ręcznie stworzonym obiektem podobnym do obiektu args {command:...,args:{author:'abc',description:'',keywords:''}} etc.
}