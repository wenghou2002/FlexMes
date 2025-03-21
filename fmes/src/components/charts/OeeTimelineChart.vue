<template>
  <div class="chart-wrapper">
    <canvas ref="chartCanvas"></canvas>
    <div v-if="isLoading" class="chart-loading">
      <font-awesome-icon icon="spinner" spin class="text-blue-500 text-3xl" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, TimeScale, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, TimeScale, Tooltip, Legend);

export default defineComponent({
  name: 'OeeTimelineChart',
  setup() {
    const chartCanvas = ref<HTMLCanvasElement | null>(null);
    const isLoading = ref(true);
    const chart = ref<Chart | null>(null);
    
    const createChart = () => {
      if (!chartCanvas.value) return;
      
      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) return;
      
      // Mock data - in a real application, this would come from a store or API
      const today = new Date();
      const dates = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });
      
      // OEE = Availability × Performance × Quality
      const availabilityData = dates.map(() => Math.floor(80 + Math.random() * 15));
      const performanceData = dates.map(() => Math.floor(75 + Math.random() * 20));
      const qualityData = dates.map(() => Math.floor(90 + Math.random() * 9));
      const oeeData = dates.map((_, i) => {
        return (availabilityData[i] * performanceData[i] * qualityData[i]) / 10000;
      });
      
      isLoading.value = false;
      
      chart.value = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [
            {
              label: 'OEE',
              data: oeeData,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderWidth: 2,
              tension: 0.3,
              fill: true,
              yAxisID: 'y'
            },
            {
              label: 'Availability',
              data: availabilityData,
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
              pointRadius: 1,
              pointHoverRadius: 5,
              tension: 0.1,
              hidden: true,
              yAxisID: 'percentage'
            },
            {
              label: 'Performance',
              data: performanceData,
              borderColor: 'rgba(255, 159, 64, 1)',
              borderWidth: 1,
              pointRadius: 1,
              pointHoverRadius: 5,
              tension: 0.1,
              hidden: true,
              yAxisID: 'percentage'
            },
            {
              label: 'Quality',
              data: qualityData,
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1,
              pointRadius: 1,
              pointHoverRadius: 5,
              tension: 0.1,
              hidden: true,
              yAxisID: 'percentage'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          scales: {
            x: {
              type: 'category',
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
              type: 'linear',
              position: 'left',
              title: {
                display: true,
                text: 'OEE (%)'
              },
              min: 0,
              max: 100,
              ticks: {
                callback: (value) => `${value}%`
              }
            },
            percentage: {
              type: 'linear',
              position: 'right',
              title: {
                display: true,
                text: 'Component (%)'
              },
              min: 0,
              max: 100,
              grid: {
                drawOnChartArea: false
              },
              ticks: {
                callback: (value) => `${value}%`
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  return `${label}: ${value.toFixed(1)}%`;
                }
              }
            },
            legend: {
              position: 'top',
              onClick: (e, legendItem, legend) => {
                const index = legendItem.datasetIndex;
                const ci = legend.chart;
                
                // Always keep OEE visible
                if (index === 0) return;
                
                const meta = ci.getDatasetMeta(index);
                meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
                
                ci.update();
              }
            }
          }
        }
      });
    };
    
    onMounted(() => {
      // Simulate API delay
      setTimeout(() => {
        createChart();
      }, 500);
    });
    
    return {
      chartCanvas,
      isLoading
    };
  }
});
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.chart-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.7);
}
</style> 