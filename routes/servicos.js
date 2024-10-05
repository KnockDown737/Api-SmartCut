const express = require('express');
const Servico = require('../models/Servico');
const router = express.Router();

// Criar um novo serviço
router.post('/', async (req, res) => {
  const { nome, preco } = req.body;
  const servico = await Servico.create({ nome, preco });
  res.json(servico);
});

// Listar todos os serviços
router.get('/', async (req, res) => {
  const servicos = await Servico.findAll();
  res.json(servicos);
});

module.exports = router;
