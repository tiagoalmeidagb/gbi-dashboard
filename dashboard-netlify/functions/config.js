// Configuração para múltiplas contas do LearnWorlds
// Este arquivo contém as configurações para integração com as APIs do LearnWorlds (BR e Internacional)

// Configurações da API LearnWorlds Brasil
const BR_API_SCHOOL_ID = process.env.BR_API_SCHOOL_ID || 'seu-school-id-br';
const BR_API_TOKEN = process.env.BR_API_TOKEN || 'seu-token-br';

// Configurações da API LearnWorlds Internacional
const INT_API_SCHOOL_ID = process.env.INT_API_SCHOOL_ID || 'seu-school-id-int';
const INT_API_TOKEN = process.env.INT_API_TOKEN || 'seu-token-int';

// URL base da API LearnWorlds
const API_BASE_URL = 'https://api.learnworlds.com';

// Exportar configurações
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
