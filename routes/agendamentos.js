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
    console.log('Verificando se o serviço existe, ID do serviço:', servicoId); // Log do ID do serviço
    const servico = await Servico.findByPk(servicoId);
    if (!servico) {
      console.log('Serviço não encontrado.'); // Log caso o serviço não seja encontrado
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    // Verifique se o profissional existe
    console.log('Verificando se o profissional existe, ID do profissional:', profissionalId); // Log do ID do profissional
    const profissional = await Profissional.findByPk(profissionalId);
    if (!profissional) {
      console.log('Profissional não encontrado.'); // Log caso o profissional não seja encontrado
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    let cliente;
    let nomeClienteUsado = nomeCliente;

    // Verifique se foi passado o clienteId (caso o cliente esteja logado no app)
    if (clienteId) {
      console.log('Verificando se o cliente existe, ID do cliente:', clienteId); // Log do ID do cliente
      cliente = await Cliente.findByPk(clienteId);
      if (!cliente) {
        console.log('Cliente não encontrado.'); // Log caso o cliente não seja encontrado
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      nomeClienteUsado = cliente.nome; // Usa o nome real do cliente logado
    } else {
      // Se não houver clienteId (caso o admin esteja criando), usa o cliente padrão
      cliente = await Cliente.findByPk(CLIENTE_PADRAO_ID);

      // Se o admin não passar um nome, usa o nome do cliente padrão
      if (!nomeCliente) {
        nomeClienteUsado = cliente.nome;
      }
    }

    // Cria o agendamento com os dados fornecidos
    console.log('Criando o agendamento com os dados fornecidos:'); // Log antes da criação
    console.log('Data:', data, 'Horário:', horario, 'Status:', status, 'ServicoId:', servicoId, 'ProfissionalId:', profissionalId, 'ClienteId:', cliente.id, 'NomeCliente:', nomeClienteUsado);

    const agendamento = await Agendamento.create({
      data,
      horario,
      ServicoId: servicoId,
      ProfissionalId: profissionalId,
      status: status || 'aberto', // O status padrão será 'aberto'
      ClienteId: cliente.id, // Associa o agendamento ao cliente (padrão ou autenticado)
      nomeCliente: nomeClienteUsado // Armazena o nome do cliente (logado ou fornecido pelo admin)
    });

    console.log('Agendamento criado com sucesso:', agendamento); // Log após criação bem-sucedida

    // Resposta com detalhes do agendamento e o nome do serviço
    res.json({
      agendamento,
      servicoNome: servico.nome,
      preco: servico.preco, 
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error); // Log detalhado do erro
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
