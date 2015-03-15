'use strict';

var lab = exports.lab = require('lab').script();
var code = require('code');

var hapi = require('hapi');

var sad = require('../');

var routes = [
  {
    method: 'GET',
    path: '/success',
    handler: function(request, reply){
      reply({ success: true });
    }
  },
  {
    method: 'GET',
    path: '/not-found',
    handler: function(request, reply){
      var err = new Error('Not Found');
      err.type = 'NOT_FOUND';
      reply(err);
    }
  },
  {
    method: 'GET',
    path: '/bad-request',
    handler: function(request, reply){
      var err = new Error('Bad Request');
      err.type = 'BAD_REQUEST';
      reply(err);
    }
  },
  {
    method: 'GET',
    path: '/no-match',
    handler: function(request, reply){
      reply({});
    }
  }
];

lab.experiment('sad', function(){

  var server;
  var called = [];

  lab.beforeEach(function(done){
    server = new hapi.Server();
    server.connection();

    server.route(routes);

    var plugin = {
      register: sad,
      options: {
        success: function(request){
          called.push('success');
          var response = request.response;

          if(response && response.source){
            return response.source.success;
          } else {
            return false;
          }
        },
        errors: {
          notFound: function(request){
            called.push('notFound');
            return request.response.type === 'NOT_FOUND';
          },
          badRequest: function(request){
            called.push('badRequest');
            return request.response.type === 'BAD_REQUEST';
          }
        }
      }
    };

    server.register(plugin, done);
  });

  lab.afterEach(function(done){
    called = [];
    done();
  });

  lab.test('ignores requests where success function returns truthy', function(done){
    server.inject('/success', function(response){
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result).to.deep.equal({ success: true });
      done();
    });
  });

  lab.test('ignores requests where no functions return truthy', function(done){
    server.inject('/no-match', function(response){
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result).to.deep.equal({});
      done();
    });
  });

  lab.test('changes the response if an error function returns true', function(done){
    server.inject('/not-found', function(response){
      code.expect(response.statusCode).to.equal(404);
      done();
    });
  });

  lab.test('calls functions in order (object order not guaranteed, but pretty consistent in V8', function(done){
    server.inject('/bad-request', function(response){
      code.expect(response.statusCode).to.equal(400);
      code.expect(called[0]).to.equal('success');
      code.expect(called[1]).to.equal('notFound');
      code.expect(called[2]).to.equal('badRequest');
      done();
    });
  });
});

lab.experiment('config options', function(){

  var server;

  lab.beforeEach(function(done){
    server = new hapi.Server();
    server.connection();
    server.route(routes);
    done();
  });

  lab.experiment('success', function(){

    lab.beforeEach(function(done){
      var plugin = {
        register: sad,
        options: {
          errors: {
            notFound: function(request){
              return request.response.type === 'NOT_FOUND';
            },
            badRequest: function(request){
              return request.response.type === 'BAD_REQUEST';
            }
          }
        }
      };

      server.register(plugin, done);
    });

    lab.test('is not required', function(done){
      server.inject('/no-match', function(response){
        code.expect(response.statusCode).to.equal(200);
        code.expect(response.result).to.deep.equal({});
        done();
      });
    });
  });

  lab.experiment('unknown errors', function(){

    lab.test('does not allow unknown boom methods', function(done){
      var plugin = {
        register: sad,
        options: {
          errors: {
            something: function(){
              return true;
            }
          }
        }
      };

      server.register(plugin, function(err){
        code.expect(err).to.exist();
        code.expect(err.message).to.contain('"something" is not allowed');
        done();
      });
    });

    lab.test('does not allow `wrap` boom method', function(done){
      var plugin = {
        register: sad,
        options: {
          errors: {
            wrap: function(){
              return true;
            }
          }
        }
      };

      server.register(plugin, function(err){
        code.expect(err).to.exist();
        code.expect(err.message).to.contain('"wrap" is not allowed');
        done();
      });
    });

    lab.test('does not allow `create` boom method', function(done){
      var plugin = {
        register: sad,
        options: {
          errors: {
            create: function(){
              return true;
            }
          }
        }
      };

      server.register(plugin, function(err){
        code.expect(err).to.exist();
        code.expect(err.message).to.contain('"create" is not allowed');
        done();
      });
    });
  });
});
