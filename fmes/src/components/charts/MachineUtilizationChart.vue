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
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default defineComponent({
  name: 'MachineUtilizationChart',
  setup() {
    const chartCanvas = ref<HTMLCanvasElement | null>(null);
    const isLoading = ref(true);
    
    const createChart = () => {
      if (!chartCanvas.value) return;
      
      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) return;
      
      // Mock data - in a real application, this would come from a store
      const machines = ['CNC-1', 'CNC-2', 'MILL-1', 'DRILL-1', 'ASSEMBLY-1', 'ASSEMBLY-2'];
      const utilization = [85, 72, 91, 68, 76, 82];
      const downtime = [5, 10, 3, 15, 8, 6];
      const maintenance = [10, 18, 6, 17, 16, 12];
      
      isLoading.value = false;
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: machines,
          datasets: [
            {
              label: 'Utilization',
              data: utilization,
              backgroundColor: 'rgba(75, 192, 192, 0.8)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            },
            {
              label: 'Downtime',
              data: downtime,
              backgroundColor: 'rgba(255, 99, 132, 0.8)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            },
            {
              label: 'Maintenance',
              data: maintenance,
              backgroundColor: 'rgba(54, 162, 235, 0.8)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Machine'
              }
            },
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Percentage (%)'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  return `${label}: ${value}%`;
                }
              }
            }
          }
        }
      }) as any;
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