// Configuração para múltiplas contas do LearnWorlds

const BR_API_SCHOOL_ID = process.env.BR_API_SCHOOL_ID || 'seu-school-id-br';
const BR_API_TOKEN = process.env.BR_API_TOKEN || 'seu-token-br';

const INT_API_SCHOOL_ID = process.env.INT_API_SCHOOL_ID || 'seu-school-id-int';
const INT_API_TOKEN = process.env.INT_API_TOKEN || 'seu-token-int';

const API_BASE_URL = 'https://api.learnworlds.com';

module.exports = {
  br: {
    schoolId: BR_API_SCHOOL_ID,
    token: BR_API_TOKEN,
    baseUrl: API_BASE_URL,
    currency: 'BRL'
  },
  international: {
    schoolId: INT_API_SCHOOL_ID,
    token: INT_API_TOKEN,
    baseUrl: API_BASE_URL,
    currency: 'USD'
  }
};
