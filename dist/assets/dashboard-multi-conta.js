// Funções utilitárias
function showLoading() {
  document.getElementById('loading-overlay').classList.remove('hidden');
}
function hideLoading() {
  document.getElementById('loading-overlay').classList.add('hidden');
}
function showError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}
function hideError() {
  document.getElementById('login-error').classList.add('hidden');
}

// Login simples (ajuste a senha conforme necessário)
const CORRECT_PASSWORD = 'demo123';
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const pwd = document.getElementById('password').value;
  if (pwd === CORRECT_PASSWORD) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    fetchRealData();
  } else {
    showError('Senha incorreta. Tente novamente.');
  }
});

// Atualiza as métricas principais
function updateMainMetrics(data) {
  // Atualiza Brasil
  document.getElementById('br-current').textContent = `R$ ${formatNumber(data.current.br.total)}`;
  document.getElementById('br-previous').textContent = `R$ ${formatNumber(data.previous.br.total)}`;
  // Atualiza Internacional (se houver)
  document.getElementById('int-current').textContent = `$ ${formatNumber(data.current.international.total)}`;
  document.getElementById('int-previous').textContent = `$ ${formatNumber(data.previous.international.total)}`;
  // Atualiza Consolidado
  document.getElementById('total-current').textContent = `R$ ${formatNumber(data.current.total)}`;
  document.getElementById('total-previous').textContent = `R$ ${formatNumber(data.previous.total)}`;
}

// Formata número para moeda
function formatNumber(num) {
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Atualiza os gráficos
function updateCharts(data) {
  // Gráfico de comparação mês atual vs ano anterior
  const ctx1 = document.getElementById('comparison-chart').getContext('2d');
  if (window.comparisonChart) window.comparisonChart.destroy();
  window.comparisonChart = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: ['Brasil', 'Internacional', 'Consolidado'],
      datasets: [
        {
          label: 'Mês Atual',
          data: [
            data.current.br.total,
            data.current.international.total,
            data.current.total
          ],
          backgroundColor: '#2563eb'
        },
        {
          label: 'Ano Anterior',
          data: [
            data.previous.br.total,
            data.previous.international.total,
            data.previous.total
          ],
          backgroundColor: '#60a5fa'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' } }
    }
  });

  // Gráfico de receita por produto (mês atual)
  const productTotals = {};
  data.current.data.forEach(p => {
    const name = p.product_name || p.product || 'Outro';
    productTotals[name] = (productTotals[name] || 0) + (parseFloat(p.amount) || 0);
  });
  const ctx2 = document.getElementById('product-revenue-chart').getContext('2d');
  if (window.productRevenueChart) window.productRevenueChart.destroy();
  window.productRevenueChart = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: Object.keys(productTotals),
      datasets: [{
        data: Object.values(productTotals),
        backgroundColor: [
          '#2563eb', '#60a5fa', '#f59e42', '#10b981', '#f43f5e', '#a78bfa', '#fbbf24'
        ]
      }]
    },
    options: { responsive: true }
  });
}

// Atualiza metas por produto (exemplo simples)
function updateProductTargets(data) {
  const container = document.getElementById('product-targets');
  container.innerHTML = '';
  // Exemplo: meta fictícia de R$ 10.000 por produto
  const meta = 10000;
  const productTotals = {};
  data.current.data.forEach(p => {
    const name = p.product_name || p.product || 'Outro';
    productTotals[name] = (productTotals[name] || 0) + (parseFloat(p.amount) || 0);
  });
  Object.entries(productTotals).forEach(([name, total]) => {
    const percent = Math.min(100, (total / meta) * 100);
    container.innerHTML += `
      <div>
        <div class="flex justify-between mb-1">
          <span class="font-semibold">${name}</span>
          <span>${formatNumber(total)} / ${formatNumber(meta)}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div class="bg-blue-600 h-3 rounded-full" style="width: ${percent}%"></div>
        </div>
      </div>
    `;
  });
}

// Busca os dados reais do backend
async function fetchRealData() {
  try {
    showLoading();
    const response = await fetch('/.netlify/functions/api-proxy');
    if (!response.ok) throw new Error('Erro ao buscar dados do servidor');
    const data = await response.json();

    updateMainMetrics(data);
    updateCharts(data);
    updateProductTargets(data);

    hideLoading();
    hideError();
  } catch (err) {
    hideLoading();
    showError('Não foi possível carregar dados reais do servidor.');
    console.error(err);
  }
}

// Atualiza mês/ano no topo
function updateHeaderLabels() {
  const now = new Date();
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const currentMonth = months[now.getMonth()];
  const currentYear = now.getFullYear();
  const previousYear = currentYear - 1;

  document.getElementById('br-current-label').textContent = `Faturamento ${currentMonth} ${currentYear}`;
  document.getElementById('br-previous-label').textContent = `Faturamento ${currentMonth} ${previousYear}`;
  document.getElementById('int-current-label').textContent = `Faturamento ${currentMonth} ${currentYear}`;
  document.getElementById('int-previous-label').textContent = `Faturamento ${currentMonth} ${previousYear}`;
  document.getElementById('total-current-label').textContent = `Faturamento ${currentMonth} ${currentYear}`;
  document.getElementById('total-previous-label').textContent = `Faturamento ${currentMonth} ${previousYear}`;
  document.getElementById('comparison-chart-title').textContent = `Vendas: ${currentMonth} ${currentYear} vs ${previousYear}`;
}

updateHeaderLabels();

// Botão de refresh
document.getElementById('refresh-button').addEventListener('click', fetchRealData);

// Se quiser carregar automaticamente ao abrir (sem login), descomente:
// fetchRealData();
