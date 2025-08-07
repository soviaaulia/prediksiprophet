const chartCtx = document.getElementById('chartPrediksi').getContext('2d');
let chart;
let originalLabels = [];
let originalYhat = [];
let originalAktual = [];
let currentLabels = [];

function filterByDate() {
  const startDate = new Date(document.getElementById('startDate').value);
  const filteredLabels = [];
  const filteredYhat = [];
  const filteredAktual = [];

  originalLabels.forEach((label, i) => {
    const date = new Date(label);
    if (date >= startDate) {
      filteredLabels.push(label);
      filteredYhat.push(originalYhat[i]);
      filteredAktual.push(originalAktual[i]);
    }
  });

  currentLabels = filteredLabels;
  const yearLabels = formatUniqueYears(filteredLabels);
  updateChart(yearLabels, filteredYhat, filteredAktual);
}

function formatUniqueYears(labels) {
  const seenYears = new Set();
  return labels.map(label => {
    const year = new Date(label).getFullYear();
    if (!seenYears.has(year)) {
      seenYears.add(year);
      return year.toString();
    } else {
      return "";
    }
  });
}

function updateChart(labels, prediksi, aktual) {
  if (chart) chart.destroy();
  chart = new Chart(chartCtx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Prediksi Harga (yhat)',
          data: prediksi,
          borderColor: 'red',
          borderWidth: 2,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: 'red'
        },
        {
          label: 'Data Aktual (y)',
          data: aktual,
          borderColor: 'blue',
          backgroundColor: 'blue',
          pointRadius: 3,
          borderWidth: 0,
          showLine: false,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: 'blue'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const idx = context.dataIndex;
              const tanggal = currentLabels[idx];
              const harga = context.formattedValue;
              return `Tanggal: ${tanggal} | Harga: ${harga}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Tahun' },
          ticks: {
            autoSkip: false,
            maxTicksLimit: 10,
            callback: function(value, index, ticks) {
              const label = this.getLabelForValue(value);
              return label !== "" ? label : null;
            }
          }
        },
        y: {
          title: { display: true, text: 'Harga (Rp)' }
        }
      }
    }
  });
}

document.getElementById('uploadCSV').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const csv = event.target.result;
    const rows = csv.trim().split('\n').map(r => r.split(','));
    const headers = rows.shift();

    const dsIndex = headers.indexOf('ds');
    const yhatIndex = headers.indexOf('yhat');
    const yIndex = headers.indexOf('y');

    const labels = [];
    const prediksi = [];
    const aktual = [];

    rows.forEach(row => {
      labels.push(row[dsIndex]);
      prediksi.push(parseFloat(row[yhatIndex]));
      if (yIndex !== -1 && row[yIndex].trim() !== '') {
        aktual.push(parseFloat(row[yIndex]));
      } else {
        aktual.push(null);
      }
    });

    originalLabels = labels;
    originalYhat = prediksi;
    originalAktual = aktual;

    currentLabels = labels;
    const yearLabels = formatUniqueYears(labels);
    updateChart(yearLabels, prediksi, aktual);
  };
  reader.readAsText(file);
});
