// Função para atualização automática de dados
// Este arquivo gerencia a atualização periódica dos dados do dashboard

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
    // Obter data atual e do ano anterior
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Primeiro dia do mês atual
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    // Último dia do mês atual
    const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // Primeiro dia do mesmo mês do ano anterior
    const startOfPreviousYearMonth = new Date(currentYear - 1, currentMonth, 1);
    // Último dia do mesmo mês do ano anterior
    const endOfPreviousYearMonth = new Date(currentYear - 1, currentMonth + 1, 0);
    
    // Converter para timestamps
    const currentMonthStart = Math.floor(startOfCurrentMonth.getTime() / 1000);
    const currentMonthEnd = Math.floor(endOfCurrentMonth.getTime() / 1000);
    const previousYearMonthStart = Math.floor(startOfPreviousYearMonth.getTime() / 1000);
    const previousYearMonthEnd = Math.floor(endOfPreviousYearMonth.getTime() / 1000);
    
    // Buscar dados do mês atual
    const [currentBrData, currentIntData] = await Promise.all([
      fetchPaymentsFromAccount(config.br, currentMonthStart, currentMonthEnd),
      fetchPaymentsFromAccount(config.international, currentMonthStart, currentMonthEnd)
    ]);
    
    // Buscar dados do mesmo mês do ano anterior
    const [previousBrData, previousIntData] = await Promise.all([
      fetchPaymentsFromAccount(config.br, previousYearMonthStart, previousYearMonthEnd),
      fetchPaymentsFromAccount(config.international, previousYearMonthStart, previousYearMonthEnd)
    ]);
    
    // Calcular totais
    const currentBrTotal = currentBrData.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const currentIntTotal = currentIntData.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const previousBrTotal = previousBrData.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const previousIntTotal = previousIntData.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    
    // Taxa de conversão aproximada USD para BRL (em produção, usar API de câmbio)
    const usdToBrl = 5.2;
    
    // Calcular total consolidado (convertendo USD para BRL)
    const currentTotal = currentBrTotal + (currentIntTotal * usdToBrl);
    const previousTotal = previousBrTotal + (previousIntTotal * usdToBrl);
    
    // Estruturar resultado
    const result = {
      current: {
        br: {
          data: currentBrData,
          total: currentBrTotal
        },
        international: {
          data: currentIntData,
          total: currentIntTotal
        },
        data: [...currentBrData, ...currentIntData],
        total: currentTotal
      },
      previous: {
        br: {
          data: previousBrData,
          total: previousBrTotal
        },
        international: {
          data: previousIntData,
          total: previousIntTotal
        },
        data: [...previousBrData, ...previousIntData],
        total: previousTotal
      },
      lastUpdated: new Date().toISOString()
    };
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Erro na atualização de dados:', error);
    
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
