const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Servico = require('./Servico');
const Profissional = require('./Profissional');
const Cliente = require('./Cliente'); // Substitui Usuario por Cliente

const Agendamento = sequelize.define('Agendamento', {
  data: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  horario: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('aberto', 'concluido', 'cancelado'),  // Enum para diferentes status
    allowNull: false,
    defaultValue: 'aberto',  // O status padrão será 'aberto'
  }
});


Agendamento.belongsTo(Servico, { foreignKey: 'ServicoId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Agendamento.belongsTo(Profissional, { foreignKey: 'ProfissionalId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Agendamento.belongsTo(Cliente, { foreignKey: 'ClienteId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

module.exports = Agendamento;
