const Sequelize = require('sequelize');

// Conexão direta com o banco usando a URL completa
const sequelize = new Sequelize('mysql://root:gXVMqqUuyVdCDGYNTDzxRkbOzJksVNAr@junction.proxy.rlwy.net:34068/railway', {
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      require: true, // Railway pode exigir SSL
      rejectUnauthorized: false // Opcional, dependendo das configurações de segurança do banco
    }
  }
});

module.exports = sequelize;
