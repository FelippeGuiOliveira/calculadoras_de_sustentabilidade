// Gráfico de barras
let delayed;
const ctx = document.getElementById('graficoAgua').getContext('2d');
const grafico = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Volume Total', 'Água Reutilizada', 'Gasto Líquido'],
    datasets: [{
      label: ['Água total', 'Água Reutilizada', 'Gasto Líquido'],
      data: [0, 0, 0],
      backgroundColor: ['#2980b9', '#27ae60', '#c0392b'],
      borderRadius: 10,
    }]
  },
  options: {
    responsive: true,
    animation: {
      duration: 1000, // 1000 milissegundos (1 segundo)
      easing: 'easeInOut'
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Volume em m³'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.parsed.y.toFixed(2)} m³`
        }
      }
    }
  }
});

// Gráfico de linha
const ctxLinha = document.getElementById('graficoEconomia').getContext('2d');
const graficoEconomia = new Chart(ctxLinha, {
  type: 'bar',
  data: {
    labels: [], // "Mês 0", "Mês 1", etc.
    datasets: [
      {
        label: 'Projeção de Economia',
        data: [], // Será a diferença entre gasto atual e valor estimado
        borderColor: '#2ecc71',
        order: 0,
        type: 'line'
      },
      {
        label: 'Gasto Líquido Estimado',
        data: [], // Será o valor estimado (após economia)
        backgroundColor: '#cc2e2e80',
        order: 1,
        borderRadius: 10
      }
    ]
  },
  options: {
    responsive: true,
    animation: {
      duration: 1000, // 1000 milissegundos (1 segundo)
      easing: 'easeInOut'
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Meses'
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'R$ (gasto por mês)'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: R$ ${ctx.parsed.y.toFixed(2)}`
        }
      }
    }
  }
});

function gastoDeAgua() {
  const meses = Number(document.getElementById('periodoMes').value);
  const gastoTotal = Number(document.getElementById('gastoTotal').value);
  const aguaReutilizada = Number(document.getElementById('aguaReutilizada').value);
  return (gastoTotal - aguaReutilizada) * meses;
}

function calcularEconomiaMensal(gastoTotal, metaPercentual, totalMeses) {
  const dados = [];
  const metaFinal = gastoTotal * (1 - metaPercentual / 100);
  const passo = (gastoTotal - metaFinal) / totalMeses;

  for (let i = 0; i <= totalMeses; i++) {
    const valor = gastoTotal - passo * i;
    dados.push(Number(valor.toFixed(2)));
  }

  return dados;
}

// Função que atualiza tudo
function criarGrafico(event) {
  event.preventDefault();

  // Inputs
  const meses = Number(document.getElementById('periodoMes').value);
  const gastoTotalMensal = Number(document.getElementById('gastoTotal').value);
  const aguaReutilizadaMensal = Number(document.getElementById('aguaReutilizada').value);
  const tarifa = Number(document.getElementById('tarifa').value);
  const metaPercentual = Number(document.getElementById('metaEconomia').value);

  // Cálculos totais para o período
  const gastoTotal = gastoTotalMensal * meses;
  const aguaReutilizada = aguaReutilizadaMensal * meses;
  const gastoLiquido = gastoTotal - aguaReutilizada;

  // Texto de resultado
  const resultado = gastoLiquido;
  const p = document.getElementById('textoResultado');
  if (resultado > 0) {
    p.innerHTML = `Total de água gasto em um período de ${meses} mês(es):<br>
      ${resultado.toFixed(2)} m³<br>
      Valor total a pagar de tarifa:<br>
      R$ ${(tarifa * resultado).toFixed(2)}`;
  } else if (resultado < 0) {
    p.innerHTML = `Total de água economizada em um período de ${meses} mês(es):<br>
      ${Math.abs(resultado).toFixed(2)} m³<br>
      Valor total a pagar de tarifa:<br>
      R$ ${(tarifa * Math.abs(resultado)).toFixed(2)}`;
  } else {
    p.innerHTML = `Sem consumo ou economia de água no período de ${meses} mês(es).`;
  }

  // Atualiza gráfico de barras com valores totais
  grafico.data.datasets[0].data = [
    gastoTotal,
    aguaReutilizada,
    gastoLiquido > 0 ? gastoLiquido : 0
  ];
  grafico.update();

  // Agora vamos atualizar gráfico de barras empilhadas com os dados corrigidos

  if (meses > 0) {
    const gastoMensal = gastoLiquido / meses;
    const labels = Array.from({ length: meses + 1 }, (_, i) => `Mês ${i}`);

    // Linha estimativa de gasto após economia
    const linhaEstimativa = calcularEconomiaMensal(gastoMensal, metaPercentual, meses);
    // Linha economia mensal = quanto foi economizado em relação ao gasto original
    const linhaEconomia = linhaEstimativa.map(valor => gastoMensal - valor);

    graficoEconomia.data.labels = labels;
    // datasets[0] => parte economia (verde)
    graficoEconomia.data.datasets[0].data = linhaEconomia;
    // datasets[1] => parte gasto estimado (vermelho)
    graficoEconomia.data.datasets[1].data = linhaEstimativa;
    graficoEconomia.update();
  }
}
