const express = require('express');
const cors = require('cors'); 
const bodyParser = require('body-parser');
const sequelize = require('./config/database');

const servicosRoutes = require('./routes/servicos');
const profissionaisRoutes = require('./routes/profissionais');
const agendamentosRoutes = require('./routes/agendamentos');
const clientesRoutes = require('./routes/Cliente'); // Caminho correto para o arquivo de clientes

const app = express();

app.use(cors());  // Ative o CORS
app.use(bodyParser.json());

app.use('/servicos', servicosRoutes);
app.use('/profissionais', profissionaisRoutes);
app.use('/agendamentos', agendamentosRoutes);
app.use('/clientes', clientesRoutes);  // Rota de clientes agora correta

sequelize.sync({ alter: true }).then(() => {
  console.log('Banco de dados sincronizado.');
  app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
  });
});
