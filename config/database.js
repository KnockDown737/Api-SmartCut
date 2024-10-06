const Sequelize = require('sequelize');

try {
  const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE, 
    process.env.MYSQL_USER, 
    process.env.MYSQL_PASSWORD, 
    {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT || 3306,
      dialect: process.env.MYSQL_DIALECT,
      logging: console.log, 
    }
  );

  module.exports = sequelize;
  console.log('Conexão com o banco de dados bem-sucedida!');
} catch (error) {
  console.error('Erro ao conectar ao banco de dados:', error);
}
