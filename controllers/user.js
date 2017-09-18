var logger = require('../servicos/logger.js');
var auth = require('../servicos/auth.js')();
var cfg = require("../config/config-jwt.js");
var jwt = require("jwt-simple");
var crypto = require('crypto');

module.exports = function(app){

  // Rota para listas todos os usuarios
  // Valida o token do usuário
  app.get('/users', auth.authenticate(), function(req, res){
    console.log('Recebida requisição de teste na porta 3000.');
    logger.debug('consultando usuários');

    var connection = app.persistencia.connectionFactory();
    var userDao = new app.persistencia.UserDao(connection);

    userDao.lista(function(erro, results){
      if (erro) {
        console.log(erro);
        res.status(500).json(erro);
        return;
      }
      console.log(results);
      res.status(200).json(results);
    });
  });

  // Rota para consultar um usuario pelo id
  app.get('/users/user/:id', auth.authenticate(), function(req, res){
    var id = req.params.id;
    console.log('consultando usuario: ' + id);

    var connection = app.persistencia.connectionFactory();
    var userDao = new app.persistencia.UserDao(connection);

    userDao.buscaPorId(id, function(erro, resultado){
      if(erro){
        console.log('erro ao consultar no banco: ' + erro);
        res.status(500).json(erro);
        return;
      }
      console.log('usuario encontrado: ' + JSON.stringify(resultado));
      res.json(resultado);
      return;
    });
  });

  // Rota para incluir um novo usuarios
  app.post("/users/user",function(req, res) {

    req.assert("nome", "Nome do usuario deve ser obrigatorio").notEmpty();
    req.assert("email", "Utilize um email no formato valido").isEmail();
    req.assert("senha", "Senha dever ter no minimo 6 caracteres").isLength({ min:1, max:12 });
    //req.assert("perfil", "Peril dever ser um inteiro").isInteger();

    req.getValidationResult().then(function(erros){
      if (!erros.isEmpty()) {
        console.log(erros.array());
        console.log('Erro de validacao encontrados');
        res.status(400).send(erros.array());
        return;
      } else {
        var user = req.body;
        var url = req.protocol + '://' + req.get('host') + req.originalUrl;
        //console.log(fullUrl);
        console.log(user);
        saveUser(user, res, url);
      }
    });
  });


  function saveUser(user, res, url) {
    console.log('Processando requisicao de inclusao de usuario');

    var connection = app.persistencia.connectionFactory();
    var userDao = new app.persistencia.UserDao(connection);

    userDao.salva(user, function(erro, resultado){
      if (erro) {
        console.log('Erro ao inserir no banco de dados ' + erro);
        res.status(400).json(erro);
      }
      else {
        console.log('Usuario criado');
        res.location("/users/user/" + user._id);
        delete user.senha; // Retira a senha da resposta para enviar a resposta
        var response = {
                 dados_do_usuario: user,
                 links: [
                   {
                     href: url + "/" + user._id,
                     rel:"confirmar",
                     method:"PUT"
                   },
                   {
                     href: url + "/" + user._id,
                     rel:"cancelar",
                     method:"DELETE"
                   }
                 ]
               }
        res.status(201).json(response);
      }
    });
  }

  app.delete('/users/user/:id', function(req, res){

    var id = req.params.id;

    var connection = app.persistencia.connectionFactory();
    var userDao = new app.persistencia.UserDao(connection);

    userDao.delete(id, function(erro){
      if (erro){
        res.status(500).send(erro);
        return;
      }
      console.log('Usuario excluido');
      res.status(204).send("OK");
    });
  });


  app.post("/users/auth",function(req, res) {

    console.log('Processando autenticacao usuario');
    logger.info('Processando autenticacao usuario');

    req.assert("email", "Utilize um email no formato valido").isEmail();
    req.assert("senha", "Senha dever ter no minimo 6 caracteres").isLength({ min:1, max:12 });

    req.getValidationResult().then(function(erros){
      if (!erros.isEmpty()) {
        console.log('Erros de validacao encontrados' + JSON.stringify(erros.array()));
        logger.info('Erros de validacao encontrados' + JSON.stringify(erros.array()));
        res.status(400).send(erros.array());
        return;
      } else {
        var user0 = req.body; // Usuario a ser autenticado

        var connection = app.persistencia.connectionFactory();
        var userDao = new app.persistencia.UserDao(connection);
        userDao.buscaPorEmail(user0.email, function(erro, resultado){
          if(erro){
            console.log('Erro ao consultar no banco: ' + erro);
            logger.info('Erro ao consultar no banco: ' + erro);
            res.status(500).json(erro);
            return;
          }

          // Usuario não encontrado na base de dados
          if (!resultado){
            console.log('Usuario não localizado na base de dados: ' + JSON.stringify(user0));
            logger.info('Usuario não localizado na base de dados: ' + JSON.stringify(user0));
            res.status(400).json(user0);
            return;
          }
          var user1 = JSON.parse(JSON.stringify(resultado)); // Usuario recuperado do banco
          if (!(crypto.createHash('md5').update(user0.senha).digest('hex') == user1.senha)) {
            console.log('Usuario/senha invalidos: ' + JSON.stringify(user0));
            logger.info('Usuario/senha invalidos: ' + JSON.stringify(user0));
            res.status(400).json(user0);
            }
          else {
            console.log('Usuario validado: ' + JSON.stringify(user0));
            logger.info('Usuario validado: ' + JSON.stringify(user0));

            var payload = {id: user1._id}
            var token = jwt.encode(payload, cfg.jwtSecret);
            var resposta = user0;
            resposta.token = token;
            res.status(200).json(resposta);
          }
          return;
        });
      }
    });
  });

}
