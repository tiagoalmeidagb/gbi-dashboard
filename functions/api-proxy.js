const axios = require('axios');

// Configuração das contas (adicione internacional se quiser)
const config = {
  br: {
    schoolId: process.env.LW_BR_CLIENT_ID,
    token: process.env.LW_BR_ACCESS_TOKEN,
    baseUrl: 'https://institute.graciebarra.com.br/admin/api/v2',
    currency: 'BRL'
  }
  // Adicione internacional se necessário
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
        items_per_page: 200,
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
    // Datas para mês atual e mesmo mês do ano anterior
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const previousYear = currentYear - 1;

    // Formatos YYYY-MM-DD
    const pad = n => String(n).padStart(2, '0');
    const startCurrent = `${currentYear}-${pad(currentMonth)}-01`;
    const endCurrent = `${currentYear}-${pad(currentMonth)}-31`;
    const startPrevious = `${previousYear}-${pad(currentMonth)}-01`;
    const endPrevious = `${previousYear}-${pad(currentMonth)}-31`;

    // Busca pagamentos mês atual e anterior
    const currentBR = await fetchPaymentsFromAccount(config.br, startCurrent, endCurrent, 'BR');
    const previousBR = await fetchPaymentsFromAccount(config.br, startPrevious, endPrevious, 'BR');

    // Para internacional: adicione aqui se/quando quiser

    // Calcula totais
    const sum = arr => arr.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);

    const data = {
      current: {
        br: { total: sum(currentBR) },
        international: { total: 0 }, // ajuste se adicionar internacional
        total: sum(currentBR),
        data: currentBR
      },
      previous: {
        br: { total: sum(previousBR) },
        international: { total: 0 },
        total: sum(previousBR),
        data: previousBR
      }
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
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
