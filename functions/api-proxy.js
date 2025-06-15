const axios = require('axios');

// Configuração das contas (pode estar em config.js)
const config = {
  br: {
    schoolId: process.env.LW_BR_CLIENT_ID,
    token: process.env.LW_BR_ACCESS_TOKEN,
    baseUrl: 'https://institute.graciebarra.com.br/admin/api/v2',
    currency: 'BRL'
  }
  // Adicione internacional se precisar
};

// Função para obter pagamentos de uma conta específica
async function fetchPaymentsFromAccount(account, createdAfter, createdBefore, source) {
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
      source: source,
      currency: account.currency
    }));

    return enhancedData;
  } catch (error) {
    console.error(`Erro ao buscar pagamentos da conta ${source}:`, error.response?.data || error.message);
    throw error;
  }
}

// Handler principal
exports.handler = async function(event, context) {
  try {
    const params = event.queryStringParameters || {};
    const { created_after, created_before, account } = params;

    let result;

    if (account === 'br' || !account) {
      const brData = await fetchPaymentsFromAccount(config.br, created_after, created_before, 'BR');
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
