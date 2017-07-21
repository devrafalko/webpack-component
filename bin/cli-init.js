/* global __dirname */

module.exports = runCliInit;

const path = require('path');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const scriptPath = __dirname;
const currentPath = process.cwd();
const semver = require('semver');
const license = require('spdx-correct');

function runCliInit(args){
  var installPath = currentPath;
  var formData, finalPath;

  validateArguments()
  .then(()=>preventModulesPath())
  .then(()=>testInitPath())
  .then(()=>checkPathContents())
  .then(()=>getFormData())
  .then(()=>copyInitFiles())
  .then(()=>generatePackage())
  .then(()=>generateHTML())
  .then(()=>generateFolders())
  .catch((msg)=>{
    if(msg) console.log(msg);
    console.log("Aborted.");
    return;
  });

  function validateArguments(){
    return new Promise((resolve,reject)=>{
      if(Array.isArray(args)){
        if(args.length) installPath = args[0];
      } else {
        var p = args['-p']||args['--path'];
        if(p&&p.length) {
          installPath = p[0];
        } else {
            reject("\x1b[31mInvalid arguments.\x1b[0m\nUse:\n  wbc init\n  wbc init <path>\n  wbc init -p <path>\n  wbc init --path <path>");
          return;
        }
      }
      resolve();
    });
  }
  
  function getFormData(){
    return new Promise((resolve)=>{
      var q = [
        {type:'input',name:'project',message:'Project name:',validate:validName},
        {type:'input',name:'version',message:'Project version:','default':'1.0.0',validate:validVersion},
        {type:'input',name:'license',message:'License:','default':'MIT',validate:validLicense},
        {type:'input',name:'author',message:'Author:'},
        {type:'input',name:'title',message:'Title:'},
        {type:'input',name:'description',message:'Description:'},
        {type:'input',name:'keywords',message:'Keywords:',filter:filterKeywords}
      ];
      console.log("Fill out the form with the data that will be used in generated files, eg. package.json and head section of html entry-point templates.");
      inquirer.prompt(q).then((a)=>{
        formData = a;
        resolve();
      });

        function validName(a){
          var tests = [
            {name:"length",test:/^.{1,214}$/.test(a),msg:"The name must contain at least 1 and at most 214 characters."},
            {name:"upperCase",test:!(/[A-Z]/.test(a)),msg:"The name can not contain capital letters."},
            {name:"chars",test:/^[a-z0-9_.-]+$/.test(a),msg:"The name must contain only url-safe characters [a-z0-9_-.]"},
            {name:"startWith",test:!(/^[._]/.test(a)),msg:"The name can not begin with period or underscore."}
          ];
          var msg = "";
          for(var i in tests){
            if(!tests[i].test) {
              msg += msg.length ? "\n   ":"";
              msg += tests[i].msg;
            };
          }
          return msg.length ? msg:true;
        }

        function validVersion(a){
          return typeof semver.valid(a) === 'string' ? true:"Invalid version.";
        }

        function validLicense(a){
          return typeof license(a) === 'string' ? true:"The license should be a valid SPDX license expression.\n   Visit https://spdx.org/licenses/";
          console.log("LIC:",license(a));
        }
        
        function filterKeywords(a){
          return a.split(' ').filter((a)=>a.length);
        }

    });
  }

  function preventModulesPath(){
    return new Promise((resolve,reject)=>{
      finalPath = path.resolve(currentPath,installPath);
      var inModulesPath = finalPath.split(path.sep).some((a)=>a==="node_modules");
      if(inModulesPath){
        var q = {type:'confirm','default':false,name:'confirm',message:'\x1b[33mYou attempt to init the new webpack-component project inside the node_modules directory. Do you want to continue?\x1b[0m'};
        inquirer.prompt(q).then((a)=>{
          if(!a.confirm){
            reject();
            return;
          } else {
            resolve();
          }
        });
      } else {
        resolve(finalPath);
      }
    });
  }

  function testInitPath(){
    return new Promise((resolve,reject)=>{
      fs.ensureDir(finalPath, (err)=>{
        if(err){
          reject("\x1b[31mThe path is inaccessible or could not be created.\x1b[0m");
        } else {
          resolve(finalPath);
        }
      });
    });
  }

  function checkPathContents(){
    return new Promise((resolve,reject)=>{
      fs.readdir(finalPath, (err, files) => {
        if(err){
          reject("\x1b[31mCould not get the access to the contents of the path directory.\x1b[0m");
        } else {
          if(files.length){
            var q = {
              type:'confirm',
              'default':false,
              name:'confirm',
              message:'\x1b[33mThe path directory contains files or folders '
                      +'which may be overriden.\x1b[0m\n  '
                      +'In order to copy missing files use:\n    '
                      +'wbc repair\n\nDo you want to continue?'};
            inquirer.prompt(q).then((a)=>{
              if(!a.confirm){
                reject();
                return;
              } else {
                resolve();
              }
            });
          } else {
            resolve();
          }
        }
      });      
    });
  }

  function copyInitFiles(){
    return new Promise((resolve,reject)=>{
      const rootDir = path.resolve(scriptPath,'./../init');
      fs.copy(rootDir,finalPath,{overwrite:true},(err)=>{
        if(err){
          reject("\x1b[31mCopying files failed.\x1b[0m");
          return;
        } else {
           console.log("\x1b[32mAll files successfully copied.\x1b[0m");
           resolve();
        }
      });
    });
  }

  function generatePackage(){
    return new Promise((resolve,reject)=>{
      const jsonPath = path.resolve(finalPath,'package.json');
      const rejectMsg = "\x1b[31mCould not update HTML data in package.json file.\x1b[0m";
      fs.readJson(jsonPath,(err,json)=>{
        if(err){
          reject(rejectMsg);
          return;
        } else {
          json.name = formData.project;
          json.version = formData.version;
          json.description = formData.description;
          json.author = formData.author;
          json.license = formData.license;
          json.keywords = formData.keywords; 
          
          fs.writeJson(jsonPath,json,{spaces:2},(err)=>{
            if(err){
              reject(rejectMsg);
            } else {
              resolve();
            }
          });          
        }
      });
      resolve();
    });
  }

  function generateHTML(){
    return new Promise((resolve,reject)=>{
      const jsonPath = path.resolve(finalPath,'helpers/html-settings.json');
      const rejectMsg = "\x1b[31mCould not update HTML data in html-settings.json file.\x1b[0m";
      fs.readJson(jsonPath,(err,json)=>{
        if(err){
          reject(rejectMsg);
          return;
        } else {
          json.author = formData.author;
          json.description = formData.description;
          json.keywords = formData.keywords.join(' ');
          json.title = formData.title;
          
          fs.writeJson(jsonPath,json,(err)=>{
            if(err){
              reject(rejectMsg);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }

  function generateFolders(){
    return new Promise((resolve,reject)=>{
      const dirStructur = {
        src:{
          assets:['data','fonts','images','scripts','styles','templates','tests'],
          components:[]
        }
      };
      var iterator = 0;
      loop(dirStructur,finalPath,()=>{
        resolve("\x1b[31mThe src folder with its contents successfully created.\x1b[0m");
      });

        function loop(obj,dirPath,done){
          const isArr = Array.isArray(obj);
          for(let i in obj){
            var dirName = isArr ? obj[i]:i;
            let newPath = path.resolve(dirPath,dirName);
            iterator++;
            console.log('before ajax: ',iterator);
            fs.ensureDir(newPath,(err)=>{
              if(err){
                reject("\x1b[31mCould not generate src folder with its contents.\x1b[0m");
              } else {
                iterator--;
                console.log("after ajax: ",iterator);
                if(typeof obj[i]==='object') loop(obj[i],newPath,done);
                if(iterator===0) done();
              }
            });
          }
        }
    });
  }
  
  
}