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
import { Chart, BarController, BarElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useQualityControlStore } from '@/stores/qualityControlStore';

Chart.register(BarController, BarElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default defineComponent({
  name: 'DefectPareto',
  setup() {
    const chartCanvas = ref<HTMLCanvasElement | null>(null);
    const isLoading = ref(true);
    const chart = ref<Chart | null>(null);
    const qualityStore = useQualityControlStore();
    
    const prepareChartData = () => {
      // Use data from quality control store
      const defects = qualityStore.sortedDefects;
      
      const labels = defects.map(d => d.name);
      const counts = defects.map(d => d.count);
      
      // Calculate cumulative percentages
      const total = counts.reduce((sum, count) => sum + count, 0);
      let cumulative = 0;
      const cumulativePercentages = counts.map(count => {
        cumulative += count;
        return (cumulative / total) * 100;
      });
      
      return {
        labels,
        counts,
        cumulativePercentages
      };
    };
    
    const createChart = () => {
      if (!chartCanvas.value) return;
      
      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) return;
      
      const { labels, counts, cumulativePercentages } = prepareChartData();
      
      isLoading.value = false;
      
      chart.value = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Defect Count',
              data: counts,
              backgroundColor: 'rgba(54, 162, 235, 0.7)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
              order: 1
            },
            {
              label: 'Cumulative %',
              data: cumulativePercentages,
              type: 'line',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
              pointBackgroundColor: 'rgba(255, 99, 132, 1)',
              pointRadius: 4,
              fill: false,
              yAxisID: 'y1',
              order: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Defect Count'
              }
            },
            y1: {
              beginAtZero: true,
              position: 'right',
              max: 100,
              title: {
                display: true,
                text: 'Cumulative %'
              },
              grid: {
                drawOnChartArea: false
              }
            },
            x: {
              title: {
                display: true,
                text: 'Defect Type'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const datasetLabel = context.dataset.label || '';
                  const value = context.parsed.y;
                  return datasetLabel === 'Cumulative %' 
                    ? `${datasetLabel}: ${value.toFixed(1)}%` 
                    : `${datasetLabel}: ${value}`;
                }
              }
            }
          }
        }
      });
    };
    
    onMounted(() => {
      // Simulate loading data
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