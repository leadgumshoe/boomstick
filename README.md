# boomstick

[![Travis Build Status](https://img.shields.io/travis/iceddev/boomstick/master.svg?label=travis&style=flat-square)](https://travis-ci.org/iceddev/boomstick)

Hapi plugin to transform application errors into boom error responses.

## Usage

```js
var hapi = require('hapi');
var boomstick = require('boomstick');

var server = new hapi.Server();
server.connection();

server.register({
  register: boomstick,
  options: {
    success: function(request){
      return !(request.response instanceof Error);
    },
    errors: {
      badRequest: function(request){
        return (request.response instanceof InvalidRequestError);
      },
      notFound: function(request){
        return (request.response.code === 404);
      }
    }
  }
}, function(){
  server.start();
});
```

## License

MIT
