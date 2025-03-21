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
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default defineComponent({
  name: 'OeePerformanceChart',
  setup() {
    const chartCanvas = ref<HTMLCanvasElement | null>(null);
    const isLoading = ref(true);
    
    const createChart = () => {
      if (!chartCanvas.value) return;
      
      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) return;
      
      // Mock data - in a real application, this would come from a store
      const currentOEE = {
        availability: 85,
        performance: 78,
        quality: 92,
        oee: 61 // OEE = Availability × Performance × Quality
      };
      
      const targetOEE = {
        availability: 90,
        performance: 85,
        quality: 98,
        oee: 75 // Target OEE
      };
      
      isLoading.value = false;
      
      new Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['Availability', 'Performance', 'Quality', 'OEE'],
          datasets: [
            {
              label: 'Current',
              data: [currentOEE.availability, currentOEE.performance, currentOEE.quality, currentOEE.oee],
              fill: true,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              pointBackgroundColor: 'rgba(54, 162, 235, 1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
            },
            {
              label: 'Target',
              data: [targetOEE.availability, targetOEE.performance, targetOEE.quality, targetOEE.oee],
              fill: true,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              pointBackgroundColor: 'rgba(255, 99, 132, 1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: {
                stepSize: 20
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || '';
                  const value = context.raw as number;
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