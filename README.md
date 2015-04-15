# boomstick

[![Travis Build Status](https://img.shields.io/travis/iceddev/boomstick/master.svg?label=travis&style=flat-square)](https://travis-ci.org/iceddev/boomstick)

Hapi plugin to transform application errors into boom error responses. Where each key in the errors object corresponds with a matching boom method.

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

## Options Object

- `success`: A checkFunction that is executed before all of the potential error cases. If the success case is matched the errors checks are bypassed entirely.

- 'errors': An Object that contains a key for each boom method you want returned, along with a matching checkFunction for determining when that error case has occured.  Each key in the errors object needs to exactly match the name of the boom method that you want executed.

- 'checkFunction': - A function that returns a boolean and has access to the Hapi request object, for error cases it should return true if that boom error should be generated.

## Additional Details

Boomstick is attached at the onPostHandler point of the Hapi request lifecycle. In the event that the function in the options.success object returns true boomstick will pass the request through untouched. If success returns false each of the other cases is checked and when one is true a boom error is generated and passed into your reply. If none of the errors are matched the request is passed through untouched.

## License

MIT
