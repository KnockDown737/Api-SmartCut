const express = require('express');
const bcrypt = require('bcrypt');
const Cliente = require('../models/Cliente');
const router = express.Router();

// Criar um novo cliente
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

// Buscar todos os clientes
router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes.' });
  }
});

// Atualizar cliente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, telefone, email, senha, tipo } = req.body;

  try {
    const cliente = await Cliente.findByPk(id);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado.' });

    if (senha) {
      const hashedPassword = await bcrypt.hash(senha, 10);
      await cliente.update({ nome, telefone, email, senha: hashedPassword, tipo });
    } else {
      await cliente.update({ nome, telefone, email, tipo });
    }

    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cliente.' });
  }
});

// Deletar cliente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await Cliente.findByPk(id);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado.' });

    await cliente.destroy();
    res.json({ message: 'Cliente removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover cliente.' });
  }
});

module.exports = router;
