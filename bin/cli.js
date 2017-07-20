#!/usr/bin/env node

const args = require('get-arguments');
const commands = ['init','repair','add','remove','list','get','set'];
const cli = {
  init:require('./cli-init')
//  repair:require('./cli-repair'),
//  add:require('./cli-add'),
//  remove:require('./cli-remove'),
//  list:require('./cli-list'),
//  set:require('./cli-set'),
//  get:require('./cli-get')
};

args(function(a){
  if(!a) return;
  console.log(a);
  cli[a.command](a.args);
});