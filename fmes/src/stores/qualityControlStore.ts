import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { QualityControlService, QualityControl, QualityControlInput } from '@/services/qcService';

export interface QualityDefect {
  id: string;
  name: string;
  count: number;
  category: string;
}

export const useQualityControlStore = defineStore('qualityControl', () => {
  // State
  const qualityControls = ref<QualityControl[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentQualityControl = ref<QualityControl | null>(null);
  const defects = ref<QualityDefect[]>([
    { id: '1', name: 'Surface Scratches', count: 145, category: 'Surface Defects' },
    { id: '2', name: 'Misalignment', count: 98, category: 'Assembly Defects' },
    { id: '3', name: 'Material Defects', count: 65, category: 'Material Issues' },
    { id: '4', name: 'Dimension Error', count: 43, category: 'Specification Defects' },
    { id: '5', name: 'Color Variation', count: 28, category: 'Visual Defects' },
  ]);

  // Getters (computed)
  const passedInspections = computed(() => 
    qualityControls.value.filter(qc => qc.result === 'Passed')
  );
  
  const failedInspections = computed(() => 
    qualityControls.value.filter(qc => qc.result === 'Failed')
  );
  
  const pendingInspections = computed(() => 
    qualityControls.value.filter(qc => qc.result === 'Pending')
  );
  
  const getQualityControlById = (id: number) => 
    qualityControls.value.find(qc => qc.id === id) || null;
    
  const getQualityControlsByProductId = (productId: number) => 
    qualityControls.value.filter(qc => qc.productId === productId);

  // Calculate total defects
  const totalDefectCount = computed(() => 
    defects.value.reduce((total, defect) => total + defect.count, 0)
  );

  // Sort defects by count (descending)
  const sortedDefects = computed(() => 
    [...defects.value].sort((a, b) => b.count - a.count)
  );

  // Group defects by category
  const defectsByCategory = computed(() => {
    const result: Record<string, QualityDefect[]> = {};
    
    defects.value.forEach(defect => {
      if (!result[defect.category]) {
        result[defect.category] = [];
      }
      result[defect.category].push(defect);
    });
    
    return result;
  });

  // Calculate defect percentage by category
  const defectPercentageByCategory = computed(() => {
    const result: Record<string, number> = {};
    const total = totalDefectCount.value;
    
    Object.entries(defectsByCategory.value).forEach(([category, defects]) => {
      const categoryTotal = defects.reduce((sum, defect) => sum + defect.count, 0);
      result[category] = (categoryTotal / total) * 100;
    });
    
    return result;
  });

  // Actions
  const fetchQualityControls = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      qualityControls.value = await QualityControlService.getAll();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error fetching quality controls:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchQualityControlById = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      currentQualityControl.value = await QualityControlService.getById(id);
      return currentQualityControl.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error(`Error fetching quality control ${id}:`, err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const createQualityControl = async (data: QualityControlInput) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const newQualityControl = await QualityControlService.create(data);
      qualityControls.value.push(newQualityControl);
      return newQualityControl;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error creating quality control:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const updateQualityControl = async (id: number, data: QualityControlInput) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const updatedQualityControl = await QualityControlService.update(id, data);
      
      // Update in the local array
      const index = qualityControls.value.findIndex(qc => qc.id === id);
      if (index !== -1) {
        qualityControls.value[index] = updatedQualityControl;
      }
      
      return updatedQualityControl;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error(`Error updating quality control ${id}:`, err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteQualityControl = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await QualityControlService.delete(id);
      qualityControls.value = qualityControls.value.filter(qc => qc.id !== id);
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error(`Error deleting quality control ${id}:`, err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const exportToCsv = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await QualityControlService.exportCsv();
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error exporting quality controls to CSV:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Function to add a new defect
  const addDefect = (defect: Omit<QualityDefect, 'id'>) => {
    const newId = `${Date.now()}`;
    defects.value.push({ ...defect, id: newId });
  };

  // Function to update a defect
  const updateDefect = (id: string, updatedData: Partial<Omit<QualityDefect, 'id'>>) => {
    const index = defects.value.findIndex(d => d.id === id);
    if (index !== -1) {
      defects.value[index] = { ...defects.value[index], ...updatedData };
    }
  };

  // Function to delete a defect
  const deleteDefect = (id: string) => {
    defects.value = defects.value.filter(d => d.id !== id);
  };

  return {
    // State
    qualityControls,
    isLoading,
    error,
    currentQualityControl,
    defects,
    
    // Getters
    passedInspections,
    failedInspections,
    pendingInspections,
    getQualityControlById,
    getQualityControlsByProductId,
    totalDefectCount,
    sortedDefects,
    defectsByCategory,
    defectPercentageByCategory,
    
    // Actions
    fetchQualityControls,
    fetchQualityControlById,
    createQualityControl,
    updateQualityControl,
    deleteQualityControl,
    exportToCsv,
    addDefect,
    updateDefect,
    deleteDefect
  };
}); 