const express = require('express');
const Agendamento = require('../models/Agendamento');
const Servico = require('../models/Servico');
const Profissional = require('../models/Profissional');
const router = express.Router();


router.post('/', async (req, res) => {
  const { data, horario, servicoId, profissionalId } = req.body;

  try {
    
    const agendamento = await Agendamento.create({
      data,
      horario,
      ServicoId: servicoId,
      ProfissionalId: profissionalId,
    });

    
    const servico = await Servico.findByPk(servicoId);

    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

   
    res.json({
      agendamento,
      servicoNome: servico.nome,
      preco: servico.preco, 
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro ao criar o agendamento' });
  }
});


router.get('/', async (req, res) => {
  try {

    const agendamentos = await Agendamento.findAll({
      include: [
        {
          model: Servico,
          attributes: ['nome', 'preco'], 
        },
        {
          model: Profissional,
          attributes: ['nome'], 
        },
      ],
    }); 


    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao listar agendamentos' });
  }
});

module.exports = router;
