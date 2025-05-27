// Dashboard de Vendas Multi-Conta - Script principal
// Este arquivo contém a lógica do dashboard e simulação de dados para múltiplas contas

// Configuração inicial
document.addEventListener('DOMContentLoaded', function() {
  // Elementos do DOM
  const loginScreen = document.getElementById('login-screen');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const loadingOverlay = document.getElementById('loading-overlay');
  const refreshButton = document.getElementById('refresh-button');
  const currentMonthElement = document.getElementById('current-month');
  const lastUpdatedElement = document.getElementById('last-updated');
  
  // Elementos de métricas
  const brCurrentElement = document.getElementById('br-current');
  const brPreviousElement = document.getElementById('br-previous');
  const brCurrentLabelElement = document.getElementById('br-current-label');
  const brPreviousLabelElement = document.getElementById('br-previous-label');
  
  const intCurrentElement = document.getElementById('int-current');
  const intPreviousElement = document.getElementById('int-previous');
  const intCurrentLabelElement = document.getElementById('int-current-label');
  const intPreviousLabelElement = document.getElementById('int-previous-label');
  
  const totalCurrentElement = document.getElementById('total-current');
  const totalPreviousElement = document.getElementById('total-previous');
  const totalCurrentLabelElement = document.getElementById('total-current-label');
  const totalPreviousLabelElement = document.getElementById('total-previous-label');
  
  // Elementos de gráficos
  const comparisonChartElement = document.getElementById('comparison-chart');
  const productRevenueChartElement = document.getElementById('product-revenue-chart');
  const comparisonChartTitleElement = document.getElementById('comparison-chart-title');
  
  // Elemento de metas
  const productTargetsElement = document.getElementById('product-targets');
  
  // Dados simulados para múltiplas contas
  const mockData = {
    // Dados do mês atual
    current: {
      // Dados Brasil
      br: {
        data: [
          { amount: 45000, currency: 'BRL', product: { title: 'Curso A' }, source: 'BR' },
          { amount: 32500, currency: 'BRL', product: { title: 'Curso B' }, source: 'BR' },
          { amount: 25800, currency: 'BRL', product: { title: 'Curso C' }, source: 'BR' },
          { amount: 18700, currency: 'BRL', product: { title: 'Curso D' }, source: 'BR' },
          { amount: 12430, currency: 'BRL', product: { title: 'Curso E' }, source: 'BR' }
        ],
        total: 134430
      },
      // Dados Internacional
      international: {
        data: [
          { amount: 28500, currency: 'USD', product: { title: 'Course A' }, source: 'INT' },
          { amount: 15700, currency: 'USD', product: { title: 'Course B' }, source: 'INT' },
          { amount: 9800, currency: 'USD', product: { title: 'Course C' }, source: 'INT' },
          { amount: 4210, currency: 'USD', product: { title: 'Course D' }, source: 'INT' }
        ],
        total: 58210
      },
      // Dados combinados
      data: [
        // BR
        { amount: 45000, currency: 'BRL', product: { title: 'Curso A' }, source: 'BR' },
        { amount: 32500, currency: 'BRL', product: { title: 'Curso B' }, source: 'BR' },
        { amount: 25800, currency: 'BRL', product: { title: 'Curso C' }, source: 'BR' },
        { amount: 18700, currency: 'BRL', product: { title: 'Curso D' }, source: 'BR' },
        { amount: 12430, currency: 'BRL', product: { title: 'Curso E' }, source: 'BR' },
        // INT
        { amount: 28500, currency: 'USD', product: { title: 'Course A' }, source: 'INT' },
        { amount: 15700, currency: 'USD', product: { title: 'Course B' }, source: 'INT' },
        { amount: 9800, currency: 'USD', product: { title: 'Course C' }, source: 'INT' },
        { amount: 4210, currency: 'USD', product: { title: 'Course D' }, source: 'INT' }
      ],
      total: 453780 // Valor convertido e consolidado
    },
    // Dados do mesmo mês do ano anterior
    previous: {
      // Dados Brasil
      br: {
        data: [
          { amount: 38200, currency: 'BRL', product: { title: 'Curso A' }, source: 'BR' },
          { amount: 27100, currency: 'BRL', product: { title: 'Curso B' }, source: 'BR' },
          { amount: 21500, currency: 'BRL', product: { title: 'Curso C' }, source: 'BR' },
          { amount: 15600, currency: 'BRL', product: { title: 'Curso D' }, source: 'BR' },
          { amount: 10800, currency: 'BRL', product: { title: 'Curso E' }, source: 'BR' }
        ],
        total: 113200
      },
      // Dados Internacional
      international: {
        data: [
          { amount: 25400, currency: 'USD', product: { title: 'Course A' }, source: 'INT' },
          { amount: 14200, currency: 'USD', product: { title: 'Course B' }, source: 'INT' },
          { amount: 8700, currency: 'USD', product: { title: 'Course C' }, source: 'INT' },
          { amount: 4240, currency: 'USD', product: { title: 'Course D' }, source: 'INT' }
        ],
        total: 52540
      },
      // Dados combinados
      data: [
        // BR
        { amount: 38200, currency: 'BRL', product: { title: 'Curso A' }, source: 'BR' },
        { amount: 27100, currency: 'BRL', product: { title: 'Curso B' }, source: 'BR' },
        { amount: 21500, currency: 'BRL', product: { title: 'Curso C' }, source: 'BR' },
        { amount: 15600, currency: 'BRL', product: { title: 'Curso D' }, source: 'BR' },
        { amount: 10800, currency: 'BRL', product: { title: 'Curso E' }, source: 'BR' },
        // INT
        { amount: 25400, currency: 'USD', product: { title: 'Course A' }, source: 'INT' },
        { amount: 14200, currency: 'USD', product: { title: 'Course B' }, source: 'INT' },
        { amount: 8700, currency: 'USD', product: { title: 'Course C' }, source: 'INT' },
        { amount: 4240, currency: 'USD', product: { title: 'Course D' }, source: 'INT' }
      ],
      total: 423600 // Valor convertido e consolidado
    }
  };
  
  // Obter o nome do mês atual em português
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const previousYearMonth = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1))
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  
  // Função para formatar valores monetários
  function formatCurrency(value, currency = 'BRL') {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return formatter.format(value);
  }
  
  // Função para calcular a variação percentual
  function calculatePercentageChange(current, previous) {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  }
  
  // Função para agrupar pagamentos por produto
  function groupPaymentsByProduct(payments) {
    if (!payments || !Array.isArray(payments)) {
      return {};
    }
    
    const productRevenue = {};
    
    payments.forEach(payment => {
      if (payment.product && payment.product.title) {
        const productName = payment.product.title;
        const amount = parseFloat(payment.amount);
        
        if (productRevenue[productName]) {
          productRevenue[productName] += amount;
        } else {
          productRevenue[productName] = amount;
        }
      }
    });
    
    return productRevenue;
  }
  
  // Função para calcular metas de vendas por produto (20% acima do ano anterior)
  function calculateProductTargets(currentProducts, previousYearProducts) {
    const targets = {};
    
    // Para cada produto do ano anterior, calcular meta
    Object.keys(previousYearProducts).forEach(productName => {
      const previousValue = previousYearProducts[productName];
      const targetValue = previousValue * 1.2; // 20% acima
      const currentValue = currentProducts[productName] || 0;
      
      targets[productName] = {
        previous: previousValue,
        target: targetValue,
        current: currentValue,
        progress: currentValue / targetValue * 100
      };
    });
    
    // Adicionar produtos novos (que não existiam no ano anterior)
    Object.keys(currentProducts).forEach(productName => {
      if (!targets[productName]) {
        const currentValue = currentProducts[productName];
        
        targets[productName] = {
          previous: 0,
          target: 0, // Sem meta definida para produtos novos
          current: currentValue,
          progress: 100 // Consideramos 100% pois não há meta
        };
      }
    });
    
    return targets;
  }
  
  // Função para atualizar as métricas principais
  function updateMetrics() {
    // Brasil (BRL)
    brCurrentElement.textContent = formatCurrency(mockData.current.br.total);
    brPreviousElement.textContent = formatCurrency(mockData.previous.br.total);
    brCurrentLabelElement.textContent = `Faturamento ${currentMonth}`;
    brPreviousLabelElement.textContent = `Faturamento ${previousYearMonth}`;
    
    // Internacional (USD)
    intCurrentElement.textContent = formatCurrency(mockData.current.international.total, 'USD');
    intPreviousElement.textContent = formatCurrency(mockData.previous.international.total, 'USD');
    intCurrentLabelElement.textContent = `Faturamento ${currentMonth}`;
    intPreviousLabelElement.textContent = `Faturamento ${previousYearMonth}`;
    
    // Consolidado
    totalCurrentElement.textContent = formatCurrency(mockData.current.total);
    totalPreviousElement.textContent = formatCurrency(mockData.previous.total);
    totalCurrentLabelElement.textContent = `Faturamento ${currentMonth}`;
    totalPreviousLabelElement.textContent = `Faturamento ${previousYearMonth}`;
  }
  
  // Função para criar o gráfico de comparação
  function createComparisonChart() {
    const ctx = comparisonChartElement.getContext('2d');
    
    // Preparar dados
    const currentProductsData = groupPaymentsByProduct(mockData.current.data);
    const previousProductsData = groupPaymentsByProduct(mockData.previous.data);
    
    const labels = Object.keys(currentProductsData);
    const currentData = labels.map(product => currentProductsData[product]);
    const previousData = labels.map(product => previousProductsData[product] || 0);
    
    // Atualizar título
    comparisonChartTitleElement.textContent = `Vendas: ${currentMonth} vs ${previousYearMonth}`;
    
    // Criar gráfico
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: currentMonth,
            data: currentData,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          },
          {
            label: previousYearMonth,
            data: previousData,
            backgroundColor: 'rgba(203, 213, 225, 0.8)',
            borderColor: 'rgba(203, 213, 225, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatCurrency(value).replace(/[^0-9]/g, '');
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + formatCurrency(context.raw);
              }
            }
          }
        }
      }
    });
    
    return chart;
  }
  
  // Função para criar o gráfico de receita por produto
  function createProductRevenueChart() {
    const ctx = productRevenueChartElement.getContext('2d');
    
    // Preparar dados
    const productData = groupPaymentsByProduct(mockData.current.data);
    const labels = Object.keys(productData);
    const data = labels.map(product => productData[product]);
    
    // Criar gráfico
    const chart = new Chart(ctx, {
      type: 'bar', // Corrigido: usar 'bar' em vez de 'horizontalBar'
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Receita',
            data: data,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        indexAxis: 'y', // Adicionado: para criar barras horizontais
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatCurrency(value).replace(/[^0-9]/g, '');
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + formatCurrency(context.raw);
              }
            }
          }
        }
      }
    });
    
    return chart;
  }
  
  // Função para atualizar a seção de metas
  function updateProductTargets() {
    // Limpar conteúdo atual
    productTargetsElement.innerHTML = '';
    
    // Preparar dados
    const currentProductsData = groupPaymentsByProduct(mockData.current.data);
    const previousProductsData = groupPaymentsByProduct(mockData.previous.data);
    const targets = calculateProductTargets(currentProductsData, previousProductsData);
    
    // Para cada produto, calcular meta e progresso
    Object.keys(targets).forEach(product => {
      const { current, previous, target, progress } = targets[product];
      
      // Determinar classe de cor com base no progresso
      let progressColorClass = 'bg-yellow-500';
      if (progress >= 100) {
        progressColorClass = 'bg-green-500';
      } else if (progress >= 70) {
        progressColorClass = 'bg-blue-500';
      } else if (progress < 50) {
        progressColorClass = 'bg-red-500';
      }
      
      // Criar elemento de produto
      const productElement = document.createElement('div');
      productElement.className = 'mb-4';
      productElement.innerHTML = `
        <div class="flex justify-between items-center mb-1">
          <span class="font-medium">${product}</span>
          <span class="text-sm">${Math.round(progress)}%</span>
        </div>
        <div class="progress-bar mb-1">
          <div class="progress-bar-fill ${progressColorClass}" style="width: ${progress}%"></div>
        </div>
        <div class="flex justify-between text-sm text-gray-500">
          <span>Atual: ${formatCurrency(current)}</span>
          <span>Meta: ${formatCurrency(target)}</span>
        </div>
      `;
      
      // Adicionar ao container
      productTargetsElement.appendChild(productElement);
    });
  }
  
  // Função para carregar dados do dashboard
  function loadDashboardData() {
    // Mostrar overlay de carregamento
    loadingOverlay.classList.remove('hidden');
    
    // Simular carregamento de dados
    setTimeout(() => {
      // Atualizar métricas
      updateMetrics();
      
      // Criar gráficos
      createComparisonChart();
      createProductRevenueChart();
      
      // Atualizar metas
      updateProductTargets();
      
      // Atualizar informações de data
      currentMonthElement.textContent = currentMonth;
      lastUpdatedElement.textContent = `Atualizado em: ${new Date().toLocaleString('pt-BR')}`;
      
      // Esconder overlay de carregamento
      loadingOverlay.classList.add('hidden');
    }, 1500);
  }
  
  // Função para autenticar usuário
  function authenticateUser(password) {
    // Simulação de autenticação (senha fixa para demonstração)
    // Na implementação real, isso seria mais seguro
    return password === 'demo123';
  }
  
  // Event Listeners
  
  // Login
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    
    if (authenticateUser(password)) {
      // Esconder tela de login
      loginScreen.classList.add('hidden');
      
      // Mostrar dashboard
      dashboard.classList.remove('hidden');
      
      // Carregar dados
      loadDashboardData();
    } else {
      // Mostrar erro
      loginError.classList.remove('hidden');
    }
  });
  
  // Botão de atualização
  refreshButton.addEventListener('click', function() {
    loadDashboardData();
  });
  
  // Inicialização
  // Nada a fazer aqui, o dashboard começa na tela de login
});
