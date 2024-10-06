const express = require('express');
const Profissional = require('../models/Profissional');
const router = express.Router();

// Criar um novo profissional (POST)
router.post('/', async (req, res) => {
  const { nome, especialidade, email, telefone } = req.body;
  try {
    const profissional = await Profissional.create({ nome, especialidade, email, telefone });
    res.json(profissional);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar o profissional.' });
  }
});


router.get('/', async (req, res) => {
  try {
    const profissionais = await Profissional.findAll();
    res.json(profissionais);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar os profissionais.' });
  }
});


router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, especialidade, email, telefone } = req.body;
  try {
    const profissional = await Profissional.findByPk(id);
    if (!profissional) {
      return res.status(404).json({ error: 'Profissional não encontrado.' });
    }
    
    await profissional.update({ nome, especialidade, email, telefone });
    res.json(profissional);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar o profissional.' });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, especialidade, email, telefone } = req.body;
  try {
    const profissional = await Profissional.findByPk(id);
    if (!profissional) {
      return res.status(404).json({ error: 'Profissional não encontrado.' });
    }

    // Atualiza apenas os campos enviados
    if (nome !== undefined) profissional.nome = nome;
    if (especialidade !== undefined) profissional.especialidade = especialidade;
    if (email !== undefined) profissional.email = email;
    if (telefone !== undefined) profissional.telefone = telefone;

    await profissional.save();
    res.json(profissional);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar parcialmente o profissional.' });
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const profissional = await Profissional.findByPk(id);
    if (!profissional) {
      return res.status(404).json({ error: 'Profissional não encontrado.' });
    }

    await profissional.destroy();
    res.json({ message: 'Profissional deletado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar o profissional.' });
  }
});

module.exports = router;

