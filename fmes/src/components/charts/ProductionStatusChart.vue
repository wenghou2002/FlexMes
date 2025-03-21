<template>
  <div class="chart-wrapper">
    <canvas ref="chartCanvas"></canvas>
    <div v-if="isLoading" class="chart-loading">
      <font-awesome-icon icon="spinner" spin class="text-blue-500 text-3xl" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { useProductionStore } from '@/stores/productionStore';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

export default defineComponent({
  name: 'ProductionStatusChart',
  setup() {
    const chartCanvas = ref<HTMLCanvasElement | null>(null);
    const isLoading = ref(true);
    const productionStore = useProductionStore();
    
    const productionData = computed(() => {
      // In a real application, this would be fetched from the store
      return {
        completed: productionStore.completedOrders || 25,
        inProgress: productionStore.inProgressOrders || 15,
        scheduled: productionStore.scheduledOrders || 10
      };
    });
    
    const createChart = () => {
      if (!chartCanvas.value) return;
      
      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) return;
      
      const data = productionData.value;
      
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'In Progress', 'Scheduled'],
          datasets: [{
            data: [data.completed, data.inProgress, data.scheduled],
            backgroundColor: [
              'rgba(75, 192, 192, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(54, 162, 235, 0.8)'
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(54, 162, 235, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw as number;
                  const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      }) as any;
      
      isLoading.value = false;
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