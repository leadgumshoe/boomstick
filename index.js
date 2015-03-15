'use strict';

var boom = require('boom');
var every = require('lodash.every');

function falsey(){
  return false;
}

function sad(server, options, next){

  var checkSuccess = options.success || falsey;
  var errors = options.errors;

  function checkErrors(request, reply){
    return every(errors, function(checkError, key){
      if(checkError(request)){
        reply(boom[key]());
        return false;
      } else {
        return true;
      }
    });
  }

  server.ext('onPostHandler', function(request, reply){

    if(checkSuccess(request)){
      return reply.continue();
    }

    if(checkErrors(request, reply)){
      reply.continue();
    }
  });

  next();
}

sad.attributes = {
  pkg: require('./package.json')
};

module.exports = {
  register: sad
};
