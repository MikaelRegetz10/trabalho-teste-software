const express = require('express');
require('dotenv').config();

const app = express();

// Ativa o leitor de JSON na raiz absoluta do Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importa as rotas DEPOIS de ativar o leitor de JSON
const routes = require('./routes');
app.use('/', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor do VôLembrar rodando na porta ${PORT}`);
});