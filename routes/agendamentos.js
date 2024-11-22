const express = require('express');
const Agendamento = require('../models/Agendamento');
const Servico = require('../models/Servico');
const Profissional = require('../models/Profissional');
const Cliente = require('../models/Cliente');
const { Op } = require('sequelize');
const router = express.Router();

const CLIENTE_PADRAO_ID = 1; // Defina o ID do cliente padrão

// Função para criar agendamento
router.post('/', async (req, res) => {
  const { data, horario, servicoId, profissionalId, status, clienteId, nomeCliente } = req.body;

  try {
    // Verifica se o serviço existe
    const servico = await Servico.findByPk(servicoId);
    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    // Verifica se o profissional existe
    const profissional = await Profissional.findByPk(profissionalId);
    if (!profissional) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    let cliente;
    let nomeClienteUsado = nomeCliente;

    // Verifica se foi passado o clienteId (caso o cliente esteja logado no app)
    if (clienteId) {
      cliente = await Cliente.findByPk(clienteId);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      nomeClienteUsado = cliente.nome;
    } else {
      // Se não houver clienteId (caso o admin esteja criando), usa o cliente padrão
      cliente = await Cliente.findByPk(CLIENTE_PADRAO_ID);
      nomeClienteUsado = nomeCliente || cliente.nome;
    }

    // Ajusta a data para garantir que ela está correta
    const formattedDate = new Date(data).toISOString().split('T')[0]; // Apenas a data no formato YYYY-MM-DD

    // Cria o agendamento
    const agendamento = await Agendamento.create({
      data: formattedDate, // Garante o formato correto
      horario,
      ServicoId: servicoId,
      ProfissionalId: profissionalId,
      status: status || 'aberto',
      ClienteId: cliente.id,
      nomeCliente: nomeClienteUsado,
    });

    res.json({
      agendamento,
      servicoNome: servico.nome,
      preco: servico.preco,
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro ao criar o agendamento', details: error.message });
  }
});

// Função para listar agendamentos com filtro de status "aberto"
router.get('/', async (req, res) => {
  const { clienteId, status } = req.query;

  try {
    const whereCondition = {
      ClienteId: clienteId,
      ...(status && { status }), // Filtra por status se passado
    };

    const agendamentos = await Agendamento.findAll({
      where: whereCondition,
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
          model: Cliente,
          attributes: ['nome'],
        },
      ],
    });

    // Ajusta as datas para o formato adequado antes de retornar
    const response = agendamentos.map((agendamento) => ({
      ...agendamento.toJSON(),
      data: new Date(agendamento.data).toISOString().split('T')[0], // Garante o formato ISO apenas com a data
    }));

    res.json(response);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao listar agendamentos' });
  }
});

// Rota para buscar o próximo agendamento
router.get('/seguinte', async (req, res) => {
  const { clienteId } = req.query;

  try {
    const seguinteAgendamento = await Agendamento.findOne({
      where: {
        ClienteId: clienteId,
        status: 'aberto', // ou 'pendente', dependendo da lógica do seu sistema
      },
      order: [['data', 'ASC'], ['horario', 'ASC']], // Ordena para pegar o mais próximo em data e horário
      include: [
        {
          model: Servico,
          attributes: ['nome', 'preco', 'duracao'], // Inclui os dados desejados do serviço
        },
        {
          model: Profissional,
          attributes: ['nome', 'especialidade'], // Inclui os dados desejados do profissional
        },
      ],
    });

    if (seguinteAgendamento) {
      res.json({
        ...seguinteAgendamento.toJSON(),
        data: new Date(seguinteAgendamento.data).toISOString().split('T')[0], // Formata a data
      });
    } else {
      res.status(404).json({ message: 'Nenhum agendamento próximo encontrado' });
    }
  } catch (error) {
    console.error('Erro ao buscar próximo agendamento:', error);
    res.status(500).json({ message: 'Erro ao buscar próximo agendamento' });
  }
});

module.exports = router;
