var mongodb = require('mongoose');

function createDBConnection(){
  var db = mongodb.createConnection('mongodb://localhost:27017/test');
  return db;
}

// wrapper
module.exports = function(){
  return createDBConnection;
}
