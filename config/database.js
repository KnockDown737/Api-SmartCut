const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE, 
  process.env.MYSQL_USER, 
  process.env.MYSQL_ROOT_PASSWORD, 
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306,  
    dialect: process.env.MYSQL_DIALECT,
  }
);

module.exports = sequelize;

