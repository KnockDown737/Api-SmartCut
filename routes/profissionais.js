const express = require('express');
const Profissional = require('../models/Profissional');
const router = express.Router();

// Criar um novo profissional
router.post('/', async (req, res) => {
  const { nome, especialidade, email, telefone } = req.body;
  try {
    const profissional = await Profissional.create({ nome, especialidade, email, telefone });
    res.json(profissional);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar o profissional.' });
  }
});

// Listar todos os profissionais
router.get('/', async (req, res) => {
  try {
    const profissionais = await Profissional.findAll();
    res.json(profissionais);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar os profissionais.' });
  }
});

module.exports = router;
