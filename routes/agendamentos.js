const express = require('express');
const Agendamento = require('../models/Agendamento');
const Servico = require('../models/Servico');
const Profissional = require('../models/Profissional');
const Cliente = require('../models/Cliente'); // Certifique-se de importar o modelo de Cliente
const router = express.Router();

const CLIENTE_PADRAO_ID = 1;  // Defina o ID do cliente padrão

// Função para criar agendamento
router.post('/', async (req, res) => {
  const { data, horario, servicoId, profissionalId, status, clienteId, nomeCliente } = req.body;

  try {
    console.log('Iniciando o processo de criação de agendamento...'); // Log de início

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

    // Verifique se foi passado o clienteId (caso o cliente esteja logado no app)
    if (clienteId) {
      cliente = await Cliente.findByPk(clienteId);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      nomeClienteUsado = cliente.nome;
    } else {
      cliente = await Cliente.findByPk(CLIENTE_PADRAO_ID);
      if (!nomeCliente) {
        nomeClienteUsado = cliente.nome;
      }
    }

    // Formatação do horário
    const horarioFormatado = horario.includes('T') ? horario.split('T')[1].substring(0, 5) : horario;

    // Cria o agendamento com os dados fornecidos
    const agendamento = await Agendamento.create({
      data,
      horario: horarioFormatado, // Usando o horário formatado
      ServicoId: servicoId,
      ProfissionalId: profissionalId,
      status: status || 'aberto', // O status padrão será 'aberto'
      ClienteId: cliente.id,
      nomeCliente: nomeClienteUsado,
    });

    res.json({
      agendamento,
      servicoNome: servico.nome,
      preco: servico.preco, 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar o agendamento', details: error.message });
  }
});

// Função para cancelar agendamento (rota PUT)
router.put('/:id/cancelar', async (req, res) => {
  const { id } = req.params;
  try {
    const agendamento = await Agendamento.findByPk(id);
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    agendamento.status = 'cancelado';
    await agendamento.save();

    res.json({ message: 'Agendamento cancelado com sucesso', agendamento });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cancelar o agendamento' });
  }
});

module.exports = router;
