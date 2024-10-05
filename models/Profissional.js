const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Profissional = sequelize.define('Profissional', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  especialidade: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Profissional;
