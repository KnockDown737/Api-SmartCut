const express = require('express');
const Agendamento = require('../models/Agendamento');
const Servico = require('../models/Servico');
const Profissional = require('../models/Profissional');
const Cliente = require('../models/Cliente'); // Certifique-se de importar o modelo de Cliente
const router = express.Router();

router.post('/', async (req, res) => {
  const { data, horario, servicoId, profissionalId, status, clienteId } = req.body;

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

    // Verifique se o cliente existe
    console.log('Verificando se o cliente existe, ID do cliente:', clienteId); // Log do ID do cliente
    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      console.log('Cliente não encontrado.'); // Log caso o cliente não seja encontrado
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Cria o agendamento com os dados fornecidos
    console.log('Criando o agendamento com os dados fornecidos:'); // Log antes da criação
    console.log('Data:', data, 'Horário:', horario, 'Status:', status, 'ServicoId:', servicoId, 'ProfissionalId:', profissionalId, 'ClienteId:', clienteId);
    
    const agendamento = await Agendamento.create({
      data,
      horario,
      ServicoId: servicoId,
      ProfissionalId: profissionalId,
      status, // Incluindo o status do agendamento
      ClienteId: clienteId // Incluindo o ClienteId
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
