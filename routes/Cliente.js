const express = require('express');
const bcrypt = require('bcrypt');
const Cliente = require('../models/Cliente'); // Certifique-se de que o nome do arquivo e o caminho estão corretos
const router = express.Router();

// Criar um novo cliente (essa parte já está no seu código)
router.post('/', async (req, res) => {
  const { nome, telefone, email, senha, tipo } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(senha, 10);
    const cliente = await Cliente.create({ nome, telefone, email, senha: hashedPassword, tipo });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cliente.' });
  }
});

// Rota de login para autenticar o cliente
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Verifica se o cliente com o email fornecido existe
    const cliente = await Cliente.findOne({ where: { email } });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    // Compara a senha fornecida com a senha armazenada (hashed)
    const senhaValida = await bcrypt.compare(senha, cliente.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    // Se a autenticação for bem-sucedida, redirecionar para a tela home
    res.json({ message: 'Login bem-sucedido', cliente });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao autenticar cliente.' });
  }
});

module.exports = router;
