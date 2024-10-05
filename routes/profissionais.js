const express = require('express');
const Profissional = require('../models/Profissional');
const router = express.Router();

// Criar um novo profissional
router.post('/', async (req, res) => {
  const { nome, especialidade } = req.body;
  const profissional = await Profissional.create({ nome, especialidade });
  res.json(profissional);
});

// Listar todos os profissionais
router.get('/', async (req, res) => {
  const profissionais = await Profissional.findAll();
  res.json(profissionais);
});

module.exports = router;
