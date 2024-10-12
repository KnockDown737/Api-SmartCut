const express = require('express');
const Agendamento = require('../models/Agendamento');
const Servico = require('../models/Servico');
const Profissional = require('../models/Profissional');
const Cliente = require('../models/Cliente');
const router = express.Router();

const CLIENTE_PADRAO_ID = 1;  // Defina o ID do cliente padrão

// Função para criar agendamento
router.post('/', async (req, res) => {
  const { data, horario, servicoId, profissionalId, status, clienteId, nomeCliente } = req.body;

  try {
    console.log('Iniciando o processo de criação de agendamento...');

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

    let cliente;
    let nomeClienteUsado = nomeCliente;

    // Verifique se foi passado o clienteId
    if (clienteId) {
      cliente = await Cliente.findByPk(clienteId);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      nomeClienteUsado = cliente.nome;
    } else {
      // Se não houver clienteId (admin), usa o cliente padrão
      cliente = await Cliente.findByPk(CLIENTE_PADRAO_ID);
      if (!nomeCliente) {
        nomeClienteUsado = cliente.nome;
      }
    }

    // Converte a data corretamente, considerando o fuso horário
    const dataFormatada = new Date(data);
    const horarioFormatado = horario.includes('T') ? horario.split('T')[1].substring(0, 5) : horario;

    // Cria o agendamento
    const agendamento = await Agendamento.create({
      data: dataFormatada,
      horario: horarioFormatado,
      ServicoId: servicoId,
      ProfissionalId: profissionalId,
      status: status || 'aberto',
      ClienteId: cliente.id,
      nomeCliente: nomeClienteUsado,
    });

    console.log('Agendamento criado com sucesso:', agendamento);

    // Resposta com detalhes do agendamento e o nome do serviço
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

// Função para listar agendamentos
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

    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao listar agendamentos' });
  }
});

// Função para atualizar agendamento
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, horario, servicoId, profissionalId, status, nomeCliente } = req.body;
  try {
    const agendamento = await Agendamento.findByPk(id);
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    // Atualiza os campos
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
