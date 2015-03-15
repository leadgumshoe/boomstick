'use strict';

var joi = require('joi');
var boom = require('boom');
var every = require('lodash.every');

function falsey(){
  return false;
}

function nonHelpers(key){
  return key !== 'wrap' && key !== 'create';
}

function generateSchema(result, key){
  result[key] = joi.func();
  return result;
}

var errorsSchema = Object.keys(boom)
  .filter(nonHelpers)
  .reduce(generateSchema, {});

var schema = joi.object().keys({
  success: joi.func(),
  errors: errorsSchema
});

function sad(server, options, next){

  var validateOptions = schema.validate(options);
  if(validateOptions.error){
    return next(validateOptions.error);
  }

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
