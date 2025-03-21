import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getProductions } from '@/services/productionService';

export const useProductionStore = defineStore('production', () => {
  const productions = ref<any[]>([]);
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  // Computed properties for different production statuses
  const completedProductions = computed(() => 
    productions.value.filter(p => p.status === 'Completed')
  );
  
  const inProgressProductions = computed(() => 
    productions.value.filter(p => p.status === 'In Progress')
  );

  // Fetch all productions
  const fetchProductions = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      productions.value = await getProductions();
    } catch (err) {
      console.error('Error fetching productions:', err);
      error.value = 'Failed to load production data';
    } finally {
      isLoading.value = false;
    }
  };

  // Update a specific production's status
  const updateProductionStatus = async (productId: string, newStatus: string) => {
    const index = productions.value.findIndex(p => p.product_id === productId);
    
    if (index !== -1) {
      productions.value[index].status = newStatus;
    }
  };

  return {
    productions,
    isLoading,
    error,
    completedProductions,
    inProgressProductions,
    fetchProductions,
    updateProductionStatus
  };
}); 