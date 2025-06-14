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

  // Obter o nome do mês atual em português
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const previousYearMonth = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1))
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Função para formatar valores monetários
  function formatCurrency(value, currency = 'BRL') {
    const formatter = new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'pt-BR', {
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
    Object.keys(currentProducts).forEach(productName => {
      if (!targets[productName]) {
        const currentValue = currentProducts[productName];
        targets[productName] = {
          previous: 0,
          target: 0,
          current: currentValue,
          progress: 100
        };
      }
    });
    return targets;
  }

  // Função para buscar dados reais da API serverless
  async function fetchRealData() {
    try {
      const response = await fetch('/.netlify/functions/api-proxy');
      if (!response.ok) throw new Error('Erro ao buscar dados');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Falha ao carregar dados reais:', error);
      return null;
    }
  }

  // Função para atualizar as métricas principais
  function updateMetrics(data) {
    // Brasil (BRL)
    brCurrentElement.textContent = formatCurrency(data.current.br.total, 'BRL');
    brPreviousElement.textContent = formatCurrency(data.previous.br.total, 'BRL');
    brCurrentLabelElement.textContent = `Faturamento ${currentMonth}`;
    brPreviousLabelElement.textContent = `Faturamento ${previousYearMonth}`;

    // Internacional (USD)
    intCurrentElement.textContent = formatCurrency(data.current.international.total, 'USD');
    intPreviousElement.textContent = formatCurrency(data.previous.international.total, 'USD');
    intCurrentLabelElement.textContent = `Faturamento ${currentMonth}`;
    intPreviousLabelElement.textContent = `Faturamento ${previousYearMonth}`;

    // Consolidado
    totalCurrentElement.textContent = formatCurrency(data.current.total, 'BRL');
    totalPreviousElement.textContent = formatCurrency(data.previous.total, 'BRL');
    totalCurrentLabelElement.textContent = `Faturamento ${currentMonth}`;
    totalPreviousLabelElement.textContent = `Faturamento ${previousYearMonth}`;
  }

  // Função para criar o gráfico de comparação
  function createComparisonChart(data) {
    const ctx = comparisonChartElement.getContext('2d');
    if (window.comparisonChartInstance) {
      window.comparisonChartInstance.destroy();
    }
    // Preparar dados
    const currentProductsData = groupPaymentsByProduct(data.current.data);
    const previousProductsData = groupPaymentsByProduct(data.previous.data);
    const labels = Object.keys(currentProductsData);
    const currentData = labels.map(product => currentProductsData[product]);
    const previousData = labels.map(product => previousProductsData[product] || 0);

    // Atualizar título
    comparisonChartTitleElement.textContent = `Vendas: ${currentMonth} vs ${previousYearMonth}`;

    window.comparisonChartInstance = new Chart(ctx, {
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
  }

  // Função para criar o gráfico de receita por produto
  function createProductRevenueChart(data) {
    const ctx = productRevenueChartElement.getContext('2d');
    if (window.productRevenueChartInstance) {
      window.productRevenueChartInstance.destroy();
    }
    // Preparar dados
    const productData = groupPaymentsByProduct(data.current.data);
    const labels = Object.keys(productData);
    const values = labels.map(product => productData[product]);
    window.productRevenueChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Receita',
            data: values,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        indexAxis: 'y',
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
  }

  // Função para atualizar a seção de metas
  function updateProductTargets(data) {
    productTargetsElement.innerHTML = '';
    const currentProductsData = groupPaymentsByProduct(data.current.data);
    const previousProductsData = groupPaymentsByProduct(data.previous.data);
    const targets = calculateProductTargets(currentProductsData, previousProductsData);
    Object.keys(targets).forEach(product => {
      const { current, previous, target, progress } = targets[product];
      let progressColorClass = 'bg-yellow-500';
      if (progress >= 100) {
        progressColorClass = 'bg-green-500';
      } else if (progress >= 70) {
        progressColorClass = 'bg-blue-500';
      } else if (progress < 50) {
        progressColorClass = 'bg-red-500';
      }
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
      productTargetsElement.appendChild(productElement);
    });
  }

  // Função para carregar dados do dashboard (agora busca dados reais)
  async function loadDashboardData() {
    loadingOverlay.classList.remove('hidden');
    const data = await fetchRealData();
    if (data && data.current && data.previous) {
      updateMetrics(data);
      createComparisonChart(data);
      createProductRevenueChart(data);
      updateProductTargets(data);
      currentMonthElement.textContent = currentMonth;
      lastUpdatedElement.textContent = `Atualizado em: ${new Date().toLocaleString('pt-BR')}`;
    } else {
      alert('Não foi possível carregar dados reais do servidor.');
    }
    loadingOverlay.classList.add('hidden');
  }

  // Função para autenticar usuário
  function authenticateUser(password) {
    // Simulação de autenticação (senha fixa para demonstração)
    return password === 'demo123';
  }

  // Event Listeners

  // Login
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;
    if (authenticateUser(password)) {
      loginScreen.classList.add('hidden');
      dashboard.classList.remove('hidden');
      loadDashboardData();
    } else {
      loginError.classList.remove('hidden');
    }
  });

  // Botão de atualização
  refreshButton.addEventListener('click', function() {
    loadDashboardData();
  });

  // Inicialização pode ser feita após login
});
