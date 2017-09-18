// auth.js
var passport = require("passport");
var passportJWT = require("passport-jwt");
var cfg = require("../config/config-jwt.js");
var ExtractJwt = passportJWT.ExtractJwt;
var Strategy = passportJWT.Strategy;
var params = {
  secretOrKey: cfg.jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};

module.exports = function(app) {
  var strategy = new Strategy(params, function(payload, done) {
    console.log("payload: " + JSON.stringify(payload));
    var connection = app.persistencia.connectionFactory();
    var userDao = new app.persistencia.UserDao(connection);
    userDao.buscaPorId(payload.id, function(erro, user){
      if(erro){
        console.log('erro ao consultar no banco: ' + erro);
        res.status(500).json(erro);
        return done(new Error("Database error"), null);
      }
      if (user) {
        console.log('usuario encontrado: ' + JSON.stringify(user));
        return done(null, user);
      }
      else {
        console.log('usuario não encontrado: ' + JSON.stringify(user));
        return done(new Error("User not found"), null);
      }
    });
  });
  passport.use(strategy);
  return {
    initialize: function() {
      return passport.initialize();
    },
    authenticate: function() {
      return passport.authenticate("jwt", cfg.jwtSession);
    }
  };

};
