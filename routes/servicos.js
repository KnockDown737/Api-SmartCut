const express = require('express');
const Servico = require('../models/Servico');
const router = express.Router();

// Criar um novo serviço
router.post('/', async (req, res) => {
  const { nome, preco, duracao } = req.body; // Incluindo 'duracao' no corpo da requisição
  try {
    const servico = await Servico.create({ nome, preco, duracao });
    res.json(servico);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar o serviço.' });
  }
});

// Listar todos os serviços
router.get('/', async (req, res) => {
  try {
    const servicos = await Servico.findAll();
    res.json(servicos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar os serviços.' });
  }
});

// Atualizar um serviço
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, preco, duracao } = req.body;
  try {
    const servico = await Servico.findByPk(id);
    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }
    
    await servico.update({ nome, preco, duracao });
    res.json(servico);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar o serviço.' });
  }
});

// Deletar um serviço
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const servico = await Servico.findByPk(id);
    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }
    
    await servico.destroy();
    res.json({ message: 'Serviço removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover o serviço.' });
  }
});

module.exports = router;
