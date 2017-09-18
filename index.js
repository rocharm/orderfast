var app = require('./config/custom-express.js')();

app.listen(3000, function(){
  console.log('Servidor rodando na porta 3000');
  //logger.info('Servidor rodando na porta 3000')
});
