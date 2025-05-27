// Função serverless para proxy da API do LearnWorlds com suporte a múltiplas contas

const axios = require('axios');
const config = require('./config');

// Função para obter pagamentos de uma conta específica
async function fetchPaymentsFromAccount(account, createdAfter, createdBefore) {
  try {
    const response = await axios({
      method: 'GET',
      url: `${account.baseUrl}/payments`,
      headers: {
        'Accept': 'application/json',
        'Lw-Client': account.schoolId,
        'Authorization': `Bearer ${account.token}`
      },
      params: {
        items_per_page: 100,
        created_after: createdAfter,
        created_before: createdBefore
      }
    });

    // Adicionar informação de origem e moeda aos dados
    const enhancedData = response.data.map(payment => ({
      ...payment,
      source: account === config.br ? 'BR' : 'INT',
      currency: account.currency
    }));

    return enhancedData;
  } catch (error) {
    console.error(`Erro ao buscar pagamentos da conta ${account === config.br ? 'BR' : 'INT'}:`, error);
    throw error;
  }
}

// Handler principal
exports.handler = async function(event, context) {
  try {
    // Obter parâmetros da requisição
    const params = event.queryStringParameters || {};
    const { created_after, created_before, account } = params;
    let result;

    // Determinar qual(is) conta(s) consultar
    if (account === 'br') {
      // Apenas conta BR
      const brData = await fetchPaymentsFromAccount(config.br, created_after, created_before);
      result = { data: brData, source: 'BR' };
    } else if (account === 'international') {
      // Apenas conta Internacional
      const intData = await fetchPaymentsFromAccount(config.international, created_after, created_before);
      result = { data: intData, source: 'INT' };
    } else {
      // Ambas as contas (padrão)
      const [brData, intData] = await Promise.all([
        fetchPaymentsFromAccount(config.br, created_after, created_before),
        fetchPaymentsFromAccount(config.international, created_after, created_before)
      ]);
      // Combinar os resultados
      result = {
        data: [...brData, ...intData],
        br: { data: brData, source: 'BR' },
        international: { data: intData, source: 'INT' }
      };
    }

    // Retornar resultado
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Erro no proxy da API:', error);
    return {
      statusCode: error.response?.status || 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message,
        details: error.response?.data || 'Sem detalhes adicionais'
      })
    };
  }
};
