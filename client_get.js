var http = require('http');

var configuracoes = {
  hostname: 'localhost',
  port: 3000,
  path: '/users/user/59bfbf2a40a1141f08385d41',
  headers: {
    'Accept': 'application/json',
    'Content-type': 'application/json',
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjU5YmZiZjJhNDBhMTE0MWYwODM4NWQ0MSJ9.0AX1f7JTKkeXzwVBkXSv1yRqcjh25WdkEuSPNvS6CTo'
  }
}

http.get(configuracoes, function(res){
  console.log(res.statusCode);
  res.on('data', function(body){
    console.log('Corpo:' + body);
  });
});
