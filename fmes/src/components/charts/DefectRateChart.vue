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
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default defineComponent({
  name: 'DefectRateChart',
  setup() {
    const chartCanvas = ref<HTMLCanvasElement | null>(null);
    const isLoading = ref(true);
    
    const createChart = () => {
      if (!chartCanvas.value) return;
      
      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) return;
      
      // Mock data - in a real application, this would come from a store
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const defectRate = [3.2, 2.8, 3.1, 2.5, 2.2, 1.9, 1.7, 1.5, 1.8, 1.6, 1.4, 1.2];
      const industryAverage = [2.8, 2.7, 2.7, 2.6, 2.5, 2.4, 2.3, 2.3, 2.2, 2.1, 2.0, 1.9];
      
      isLoading.value = false;
      
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Defect Rate (%)',
              data: defectRate,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderWidth: 2,
              tension: 0.3,
              fill: true
            },
            {
              label: 'Industry Average',
              data: industryAverage,
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2,
              borderDash: [5, 5],
              fill: false,
              tension: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 5,
              title: {
                display: true,
                text: 'Defect Rate (%)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Month'
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
            }
          }
        }
      });
    };
    
    onMounted(() => {
      // Simulate data loading
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