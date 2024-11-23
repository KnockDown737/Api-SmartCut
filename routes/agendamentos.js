const express = require('express');
const { Op } = require('sequelize');
const Agendamento = require('../models/Agendamento');
const Servico = require('../models/Servico');
const Profissional = require('../models/Profissional');
const Cliente = require('../models/Cliente');
const router = express.Router();

const CLIENTE_PADRAO_ID = 1; // ID do cliente padrão

// Função para criar agendamento
router.post('/', async (req, res) => {
  const { data, horario, servicoId, profissionalId, status, clienteId, nomeCliente } = req.body;

  try {
    console.log('Iniciando o processo de criação de agendamento...');

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

    // Formata o horário para "HH:mm:ss"
    const horarioFormatado = horario.includes('AM') || horario.includes('PM')
      ? new Date(`1970-01-01T${horario}`).toTimeString().split(' ')[0]
      : horario;

    // Cria o agendamento
    const agendamento = await Agendamento.create({
      data, // A data já deve estar no formato "YYYY-MM-DD"
      horario: horarioFormatado,
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


// Rota para listar agendamentos com status "concluído" e "cancelado"
router.get('/historico', async (req, res) => {
  const { clienteId } = req.query;

  try {
    const whereCondition = clienteId
      ? { ClienteId: clienteId, status: { [Op.in]: ['concluido', 'cancelado'] } }
      : { status: { [Op.in]: ['concluido', 'cancelado'] } };

    const agendamentosHistorico = await Agendamento.findAll({
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

    res.json(agendamentosHistorico);
  } catch (error) {
    console.error('Erro ao listar histórico de agendamentos:', error);
    res.status(500).json({ error: 'Erro ao listar histórico de agendamentos' });
  }
});

router.get('/', async (req, res) => {
  const { clienteId, status } = req.query;

  try {
    const whereCondition = {
      ClienteId: clienteId,
    };

    if (status) {
      whereCondition.status = status;
    }

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
      order: [['data', 'ASC']],
    });

    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao listar os agendamentos:', error);
    res.status(500).json({ error: 'Erro ao listar os agendamentos' });
  }
});
// Rota para listar o próximo agendamento
router.get('/seguinte', async (req, res) => {
  const { clienteId } = req.query;

  try {
    const seguinteAgendamento = await Agendamento.findOne({
      where: {
        ClienteId: clienteId,
        status: 'aberto',
      },
      order: [['data', 'ASC'], ['horario', 'ASC']],
      include: [
        {
          model: Servico,
          attributes: ['nome', 'preco', 'duracao'],
        },
        {
          model: Profissional,
          attributes: ['nome', 'especialidade'],
        },
      ],
    });

    if (seguinteAgendamento) {
      res.json(seguinteAgendamento);
    } else {
      res.status(404).json({ message: 'Nenhum agendamento próximo encontrado' });
    }
  } catch (error) {
    console.error('Erro ao buscar próximo agendamento:', error);
    res.status(500).json({ message: 'Erro ao buscar próximo agendamento' });
  }
});


// Função para cancelar/agendar atualização de agendamento (rota PUT)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, horario, servicoId, profissionalId, status, nomeCliente } = req.body;

  try {
    const agendamento = await Agendamento.findByPk(id);
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    // Formata o horário para "HH:mm:ss" caso esteja no formato AM/PM
    const horarioFormatado = horario
      ? horario.includes('AM') || horario.includes('PM')
        ? new Date(`1970-01-01T${horario}`).toTimeString().split(' ')[0]
        : horario
      : agendamento.horario;

    // Atualiza os campos com os valores fornecidos ou mantém os existentes
    agendamento.data = data || agendamento.data;
    agendamento.horario = horarioFormatado;
    agendamento.ServicoId = servicoId || agendamento.ServicoId;
    agendamento.ProfissionalId = profissionalId || agendamento.ProfissionalId;
    agendamento.status = status || agendamento.status;
    agendamento.nomeCliente = nomeCliente || agendamento.nomeCliente;

    await agendamento.save();

    res.json({ message: 'Agendamento atualizado com sucesso', agendamento });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar agendamento', details: error.message });
  }
});



module.exports = router;
