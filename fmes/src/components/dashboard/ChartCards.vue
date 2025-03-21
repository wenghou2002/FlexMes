<template>
  <div class="chart-cards-container">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Production Status Chart -->
      <div class="chart-card">
        <div class="chart-card-header">
          <h3 class="chart-title">
            <font-awesome-icon icon="chart-pie" class="mr-2 text-slate-600" />
            Production Status
          </h3>
          <div class="chart-actions">
            <button class="chart-action-button">
              <font-awesome-icon icon="ellipsis-v" />
            </button>
          </div>
        </div>
        <div class="chart-card-body">
          <production-status-chart />
        </div>
      </div>
      
      <!-- Machine Utilization Chart -->
      <div class="chart-card">
        <div class="chart-card-header">
          <h3 class="chart-title">
            <font-awesome-icon icon="industry" class="mr-2 text-slate-600" />
            Machine Utilization
          </h3>
          <div class="chart-actions">
            <button class="chart-action-button">
              <font-awesome-icon icon="ellipsis-v" />
            </button>
          </div>
        </div>
        <div class="chart-card-body">
          <machine-utilization-chart />
        </div>
      </div>
      
      <!-- Defect Pareto Chart -->
      <div class="chart-card">
        <div class="chart-card-header">
          <h3 class="chart-title">
            <font-awesome-icon icon="exclamation-triangle" class="mr-2 text-slate-600" />
            Quality Defects (Pareto)
          </h3>
          <div class="chart-actions">
            <button class="chart-action-button">
              <font-awesome-icon icon="ellipsis-v" />
            </button>
          </div>
        </div>
        <div class="chart-card-body">
          <defect-pareto />
        </div>
      </div>
      
      <!-- OEE Performance Chart -->
      <div class="chart-card">
        <div class="chart-card-header">
          <h3 class="chart-title">
            <font-awesome-icon icon="chart-line" class="mr-2 text-slate-600" />
            OEE Performance
          </h3>
          <div class="chart-actions">
            <button class="chart-action-button">
              <font-awesome-icon icon="ellipsis-v" />
            </button>
          </div>
        </div>
        <div class="chart-card-body">
          <oee-performance-chart />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ProductionStatusChart from '@/components/charts/ProductionStatusChart.vue';
import MachineUtilizationChart from '@/components/charts/MachineUtilizationChart.vue';
import DefectPareto from '@/components/charts/DefectPareto.vue';
import OeePerformanceChart from '@/components/charts/OeePerformanceChart.vue';

export default defineComponent({
  name: 'ChartCards',
  components: {
    ProductionStatusChart,
    MachineUtilizationChart,
    DefectPareto,
    OeePerformanceChart
  }
});
</script>

<style scoped>
.chart-cards-container {
  width: 100%;
  overflow: hidden;
}

.chart-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  height: 100%;
}

.chart-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.chart-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f9fafb;
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
}

.chart-actions {
  display: flex;
  align-items: center;
}

.chart-action-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.chart-action-button:hover {
  background-color: #f5f5f5;
}

.chart-card-body {
  padding: 1rem;
  flex-grow: 1;
  height: 300px;
  max-height: 300px;
  overflow: hidden;
}
</style> 