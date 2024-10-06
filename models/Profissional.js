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
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,  // Validação para garantir que o email seja válido
    },
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Profissional;
