const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Servico = require('./Servico');
const Profissional = require('./Profissional');
const Cliente = require('./Cliente'); // Substitui Usuario por Cliente

const Agendamento = sequelize.define('Agendamento', {
  data: {
    type: DataTypes.DATEONLY, // Armazena apenas a data (YYYY-MM-DD)
    allowNull: false,
  },
  horario: {
    type: DataTypes.TIME, // Altere para TIME para armazenar horários no formato HH:mm:ss
    allowNull: false,
    validate: {
      is: /^([01]\d|2[0-3]):([0-5]\d)$/, // Aceita apenas formato HH:mm (24 horas)
    },
  },
  status: {
    type: DataTypes.ENUM('aberto', 'concluido', 'cancelado'), // Enum para diferentes status
    allowNull: true,
    defaultValue: 'aberto', // O status padrão será 'aberto'
  },
  nomeCliente: {
    type: DataTypes.STRING, // Campo para armazenar o nome do cliente
    allowNull: true, // Será preenchido apenas para agendamentos do admin
  },
});


Agendamento.belongsTo(Servico, { foreignKey: 'ServicoId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Agendamento.belongsTo(Profissional, { foreignKey: 'ProfissionalId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Agendamento.belongsTo(Cliente, { foreignKey: 'ClienteId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

module.exports = Agendamento;
