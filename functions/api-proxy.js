const axios = require('axios');

// Pegue as variáveis do ambiente
const LW_BR_CLIENT_ID = process.env.LW_BR_CLIENT_ID;
const LW_BR_ACCESS_TOKEN = process.env.LW_BR_ACCESS_TOKEN;
// Se usar internacional, adicione também as variáveis dela

const API_BASE_URL = 'https://institute.graciebarra.com.br/admin/api/v2';

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

    let paymentsArray = [];
    if (Array.isArray(response.data)) {
      paymentsArray = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      paymentsArray = response.data.data;
    } else if (response.data && typeof response.data === 'object') {
      paymentsArray = Object.values(response.data);
    } else {
      paymentsArray = [];
    }

    const enhancedData = paymentsArray.map(payment => ({
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

// Configuração das contas (pode estar em config.js)
const config = {
  br: {
    schoolId: LW_BR_CLIENT_ID,
    token: LW_BR_ACCESS_TOKEN,
    baseUrl: API_BASE_URL,
    currency: 'BRL'
  }
  // Adicione internacional se precisar
};

// Handler principal
exports.handler = async function(event, context) {
  try {
    const params = event.queryStringParameters || {};
    const { created_after, created_before, account } = params;

    let result;

    if (account === 'br' || !account) {
      const brData = await fetchPaymentsFromAccount(config.br, created_after, created_before);
      result = { data: brData, source: 'BR' };
    } else {
      // Adicione lógica para internacional se necessário
      result = { data: [], source: 'INT' };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Erro no proxy da API:', error);

    return {
      statusCode: error.response?.status || 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: error.message,
        details: error.response?.data || 'Sem detalhes adicionais'
      })
    };
  }
};
