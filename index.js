const express = require('express');
const cors = require('cors'); 
const bodyParser = require('body-parser');
const sequelize = require('./config/database');

const servicosRoutes = require('./routes/servicos');
const profissionaisRoutes = require('./routes/profissionais');
const agendamentosRoutes = require('./routes/agendamentos');

const app = express();

app.use(cors());  // Ative o CORS
app.use(bodyParser.json());

app.use('/servicos', servicosRoutes);
app.use('/profissionais', profissionaisRoutes);
app.use('/agendamentos', agendamentosRoutes);

sequelize.sync({ force: true }).then(() => {
  console.log('Banco de dados sincronizado.');
  app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
  });
});
