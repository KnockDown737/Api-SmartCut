const Sequelize = require('sequelize');

// Usando as variáveis de ambiente para configurar a conexão
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306, // Usa a porta do Railway ou 3306 como padrão
    dialect: process.env.MYSQL_DIALECT || 'mysql', // Usa o dialecto mysql por padrão
    dialectOptions: {
      ssl: {
        require: true, // Railway pode exigir SSL
        rejectUnauthorized: false // Dependendo da segurança, pode ser opcional
      }
    }
  }
);

module.exports = sequelize;
