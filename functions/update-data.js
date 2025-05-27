const axios = require('axios');
const config = require('./config');

// Função para obter dados do mês atual de uma conta específica
const getCurrentMonthData = async (account) => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const createdAfter = firstDay.toISOString().split('T')[0];
  const createdBefore = lastDay.toISOString().split('T')[0];
  return fetchPayments(account, createdAfter, createdBefore);
};

// Função para obter dados do mesmo mês do ano anterior de uma conta específica
const getPreviousYearData = async (account) => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear() - 1, now.getMonth() + 1, 0);
  const createdAfter = firstDay.toISOString().split('T')[0];
  const createdBefore = lastDay.toISOString().split('T')[0];
  return fetchPayments(account, createdAfter, createdBefore);
};

// Função para buscar pagamentos de uma conta específica
const fetchPayments = async (account, createdAfter, createdBefore) => {
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
};

// Função para salvar dados em cache
const saveDataToCache = async (data) => {
  // Em um ambiente real, você salvaria em um banco de dados ou serviço de cache
  // Para este exemplo, vamos apenas retornar os dados
  return data;
};

// Handler principal
exports.handler = async function(event, context) {
  try {
    // Buscar dados atuais e do ano anterior para ambas as contas
    const [brCurrentData, brPreviousYearData, intCurrentData, intPreviousYearData] = await Promise.all([
      getCurrentMonthData(config.br),
      getPreviousYearData(config.br),
      getCurrentMonthData(config.international),
      getPreviousYearData(config.international)
    ]);

    // Combinar dados de ambas as contas
    const currentData = [...brCurrentData, ...intCurrentData];
    const previousYearData = [...brPreviousYearData, ...intPreviousYearData];

    // Salvar dados em cache
    await saveDataToCache({
      current: {
        data: currentData,
        br: { data: brCurrentData, source: 'BR' },
        international: { data: intCurrentData, source: 'INT' }
      },
      previous: {
        data: previousYearData,
        br: { data: brPreviousYearData, source: 'BR' },
        international: { data: intPreviousYearData, source: 'INT' }
      },
      lastUpdated: new Date().toISOString()
    });

    // Retornar sucesso
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Dados atualizados com sucesso',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Erro na atualização automática:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        details: error.response?.data || 'Sem detalhes adicionais'
      })
    };
  }
};
