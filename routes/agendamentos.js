const express = require('express');
const Agendamento = require('../models/Agendamento');
const Servico = require('../models/Servico');
const Profissional = require('../models/Profissional');
const Cliente = require('../models/Cliente');
const { Op } = require('sequelize'); // Certifique-se de importar o Op para realizar as operações
const router = express.Router();

const CLIENTE_PADRAO_ID = 1;  // Defina o ID do cliente padrão

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


    // Cria o agendamento
    const agendamento = await Agendamento.create({
      data: isoDate,
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
router.get('/abertos', async (req, res) => {
  const { clienteId, status } = req.query;

  try {
    // Filtra o cliente e o status
    const whereCondition = {
      ClienteId: clienteId,
      status: status || 'aberto'  // Default to 'aberto' if no status is passed
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

    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao listar agendamentos' });
  }
});

// Rota para listar agendamentos com status "concluído" e "cancelado"
router.get('/historico', async (req, res) => {
  const { clienteId } = req.query;

  try {
    const whereCondition = clienteId 
      ? { ClienteId: clienteId, status: { [Op.in]: ['concluído', 'cancelado'] } } 
      : { status: { [Op.in]: ['concluído', 'cancelado'] } };

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

// Função para listar todos os agendamentos (usada para o admin ou sem filtro)
router.get('/', async (req, res) => {
  const { clienteId } = req.query; 
  try {
    const whereCondition = clienteId ? { ClienteId: clienteId } : {}; 
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
    const agendamentosFormatados = agendamentos.map(agendamento => ({
      ...agendamento.dataValues,
      data: new Date(agendamento.data).toISOString().split('T')[0]
    }));
    res.json(agendamentosFormatados);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao listar agendamentos' });
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
    agendamento.data = data || agendamento.data;
    agendamento.horario = horario || agendamento.horario;
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
