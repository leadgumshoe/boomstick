# sad
Hapi plugin to transform application errors into proper response codes

## Usage

```js
var hapi = require('hapi');
var sad = require('sad');

var server = new hapi.Server();
server.connection();

server.register({
  register: sad,
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
