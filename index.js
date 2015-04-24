'use strict';

var joi = require('joi');
var boom = require('boom');
var has = require('lodash.has');
var every = require('lodash.every');
var assign = require('lodash.assign');

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
  errors: errorsSchema,
  metadataKey: joi.string().default('expose')
});

function boomstick(server, options, next){

  var validateOptions = schema.validate(options);
  if(validateOptions.error){
    return next(validateOptions.error);
  }

  var checkSuccess = validateOptions.value.success || falsey;
  var errors = validateOptions.value.errors;
  var metadataKey = validateOptions.value.metadataKey;

  function checkErrors(request, reply){
    return every(errors, function(checkError, key){
      if(checkError(request)){
        var boomError = boom[key]();
        if(has(request.response, metadataKey)){
          assign(boomError.output.payload, request.response[metadataKey]);
        }
        reply(boomError);
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

boomstick.attributes = {
  pkg: require('./package.json')
};

module.exports = {
  register: boomstick
};
