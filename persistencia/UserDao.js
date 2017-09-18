var crypto = require('crypto');
var mongodb = require('mongoose');
var user_status = require('../constantes/user_status').USER_STATUS;

function UserDao(connection) {
    this._connection = connection;

}
UserDao.prototype.lista = function(callback) {
  var users = this._connection.model('users', new mongodb.Schema({}));
  //Retorna todos os registros
  users.find(callback);
}

UserDao.prototype.buscaPorId = function(id, callback) {
  var o_id = mongodb.Types.ObjectId(id); // Transforma o id num ObjectId
  var users = this._connection.model('users', new mongodb.Schema({}));
  users.findOne({_id: o_id}, callback);
}

UserDao.prototype.buscaPorEmail = function(email, callback) {
  //var o_id = mongodb.Types.ObjectId(id);
  var users = this._connection.model('users', new mongodb.Schema({}));
  users.findOne({email: email}, callback);
}

UserDao.prototype.delete = function(id, callback) {
  //var o_id = mongodb.Types.ObjectId(id);
  var users = this._connection.model('users', new mongodb.Schema({}));
  users.remove({_id: mongodb.Types.ObjectId(id)}, callback);
}

UserDao.prototype.salva = function(user,callback) {
  user.data_criacao = new Date();
  user.status = user_status.USER_STATUS_CRIADO;
  user.senha = crypto.createHash('md5').update(user.senha).digest('hex');
  this._connection.collection('users').insert(user, callback);
}


module.exports = function(){
    return UserDao;
};
