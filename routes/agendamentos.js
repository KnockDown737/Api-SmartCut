const express = require('express');
const Agendamento = require('../models/Agendamento');
const Servico = require('../models/Servico');
const Profissional = require('../models/Profissional');
const Cliente = require('../models/Cliente'); // Certifique-se de importar o modelo de Cliente
const router = express.Router();

router.post('/', async (req, res) => {
  const { data, horario, servicoId, profissionalId, status, clienteId } = req.body;

  try {
    // Verifique se o serviço existe
    const servico = await Servico.findByPk(servicoId);
    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    // Verifique se o profissional existe
    const profissional = await Profissional.findByPk(profissionalId);
    if (!profissional) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    // Verifique se o cliente existe
    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Cria o agendamento com os dados fornecidos
    const agendamento = await Agendamento.create({
      data,
      horario,
      ServicoId: servicoId,
      ProfissionalId: profissionalId,
      status, // Incluindo o status do agendamento
      ClienteId: clienteId // Incluindo o ClienteId
    });

    // Resposta com detalhes do agendamento e o nome do serviço
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
        {
          model: Cliente, // Inclui também o Cliente na resposta
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
