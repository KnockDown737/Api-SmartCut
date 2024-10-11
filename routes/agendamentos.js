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
    console.log('Verificando se o serviço existe, ID do serviço:', servicoId);
    const servico = await Servico.findByPk(servicoId);
    if (!servico) {
      console.log('Serviço não encontrado.');
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    // Verifique se o profissional existe
    console.log('Verificando se o profissional existe, ID do profissional:', profissionalId);
    const profissional = await Profissional.findByPk(profissionalId);
    if (!profissional) {
      console.log('Profissional não encontrado.');
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    let cliente;
    // Verifique se foi passado o clienteId (caso o cliente esteja logado no app)
    if (clienteId) {
      console.log('Verificando se o cliente existe, ID do cliente:', clienteId);
      cliente = await Cliente.findByPk(clienteId);
      if (!cliente) {
        console.log('Cliente não encontrado.');
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
    } else {
      // Se não houver clienteId (caso o admin esteja criando), usa o cliente padrão
      cliente = await Cliente.findByPk(CLIENTE_PADRAO_ID);

      // Atualiza o nome do cliente padrão com o nome do cliente inserido pelo admin
      if (nomeCliente) {
        console.log('Atualizando nome do cliente padrão para:', nomeCliente);
        await Cliente.update({ nome: nomeCliente }, { where: { id: CLIENTE_PADRAO_ID } });
      }
    }

    // Cria o agendamento com os dados fornecidos
    console.log('Criando o agendamento com os dados fornecidos:');
    console.log('Data:', data, 'Horário:', horario, 'Status:', status, 'ServicoId:', servicoId, 'ProfissionalId:', profissionalId, 'ClienteId:', cliente.id);

    const agendamento = await Agendamento.create({
      data,
      horario,
      ServicoId: servicoId,
      ProfissionalId: profissionalId,
      status: status || 'aberto', // O status padrão será 'aberto'
      ClienteId: cliente.id,
      nomeCliente: nomeCliente || cliente.nome // Incluindo o nomeCliente
    });

    console.log('Agendamento criado com sucesso:', agendamento);

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
  const { clienteId } = req.query; // Captura o ID do cliente da query string

  try {
    const whereCondition = clienteId ? { ClienteId: clienteId } : {}; // Condição de filtro se clienteId for fornecido
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

// Método PUT para atualizar um agendamento
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, horario, servicoId, profissionalId, status, nomeCliente } = req.body;

  try {
    const agendamento = await Agendamento.findByPk(id);
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    // Atualize os campos do agendamento
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
