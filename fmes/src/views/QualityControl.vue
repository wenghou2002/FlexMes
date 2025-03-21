<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Quality Control Dashboard</h1>
      <div class="flex space-x-2">
        <button @click="showCreateModal" class="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors">
          <font-awesome-icon icon="plus" class="mr-2" />
          New Inspection
        </button>
        <button @click="exportCsv" class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
          <font-awesome-icon icon="download" class="mr-2" />
          Export
        </button>
      </div>
    </div>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div v-for="(stat, index) in stats" :key="index" class="bg-white p-6 rounded-lg shadow-sm border-l-4" :class="stat.borderColor">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm text-gray-500 mb-1">{{ stat.title }}</p>
            <h3 class="text-2xl font-bold text-gray-800">{{ stat.value }}</h3>
          </div>
          <div :class="stat.bgColor" class="p-3 rounded-full">
            <font-awesome-icon :icon="stat.icon" class="text-white text-xl" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Inspections Table -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 class="text-lg font-medium text-gray-800">Recent Quality Inspections</h2>
        <div class="flex items-center">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search..." 
            class="px-4 py-2 border border-gray-300 rounded-lg mr-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <select 
            v-model="resultFilter" 
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Results</option>
            <option value="Passed">Passed</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspection ID</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="inspection in filteredInspections" :key="inspection.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ inspection.displayId || inspection.id || inspection.inspection_id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ inspection.product?.name || 'N/A' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(inspection.inspection_date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getResultClass(inspection.result)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ inspection.result }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="viewDetails(inspection)" class="text-teal-600 hover:text-teal-900 mr-3">
                  <font-awesome-icon icon="eye" />
                </button>
                <button @click="showEditModal(inspection)" class="text-blue-600 hover:text-blue-900 mr-3">
                  <font-awesome-icon icon="edit" />
                </button>
                <button @click="confirmDelete(inspection)" class="text-red-600 hover:text-red-900">
                  <font-awesome-icon icon="trash" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Showing <span class="font-medium">{{ filteredInspections.length }}</span> records
          </div>
          <div class="flex space-x-2">
            <button 
              @click="prevPage" 
              :disabled="currentPage === 1"
              class="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              @click="nextPage" 
              :disabled="currentPage * pageSize >= filteredInspections.length"
              class="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <transition name="modal-fade">
      <div v-if="showModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg w-full max-w-md shadow-2xl">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">{{ isEditing ? 'Edit' : 'New' }} Inspection</h2>
            <button @click="hideModal" class="text-gray-500 hover:text-gray-700">
              <font-awesome-icon icon="times" />
            </button>
          </div>

          <!-- Form -->
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Product:</label>
            <select 
              v-model="currentInspection.product_id" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            >
              <option value="">Select a product</option>
              <option v-for="product in products" :key="product.id" :value="product.id.toString()">
                {{ product.name }}
              </option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Inspection Date:</label>
            <input 
              v-model="currentInspection.inspection_date" 
              type="date" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            >
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Result:</label>
            <select 
              v-model="currentInspection.result" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            >
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <!-- Modal Buttons -->
          <div class="flex justify-end space-x-3 mt-6">
            <button 
              @click="hideModal" 
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="saveInspection" 
              class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              {{ isEditing ? 'Update' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete Confirmation Modal -->
    <transition name="modal-fade">
      <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg w-full max-w-md shadow-2xl">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Confirm Delete</h2>
            <p class="mt-2 text-gray-600">Are you sure you want to delete this inspection? This action cannot be undone.</p>
          </div>

          <div class="flex justify-end space-x-3">
            <button 
              @click="hideDeleteModal" 
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="deleteInspection" 
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useToast } from 'vue-toastification';
import { 
  faPlus, 
  faFilter, 
  faArrowUp, 
  faArrowDown, 
  faEye, 
  faEdit,
  faTrash,
  faFilePdf, 
  faFlag,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faPercentage,
  faChartLine,
  faDownload,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { getInspections, createInspection, updateInspection, deleteInspection as deleteInspectionApi, QualityControlService } from '@/services/qcService';
import { getProductions } from '@/services/productionService';
import { format } from 'date-fns';

// Add icons to the library
library.add(
  faPlus, 
  faFilter, 
  faArrowUp, 
  faArrowDown, 
  faEye, 
  faEdit,
  faTrash,
  faFilePdf, 
  faFlag,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faPercentage,
  faChartLine,
  faDownload,
  faTimes
);

export default {
  name: 'QualityControlView',
  components: {
    FontAwesomeIcon
  },
  setup() {
    const toast = useToast();

    const stats = computed(() => [
      {
        title: 'Total Inspections',
        value: inspections.value.length,
        icon: 'check-circle',
        borderColor: 'border-blue-500',
        bgColor: 'bg-blue-500'
      },
      {
        title: 'Pass Rate',
        value: `${calculatePassRate()}%`,
        icon: 'percentage',
        borderColor: 'border-green-500',
        bgColor: 'bg-green-500'
      },
      {
        title: 'Issues Detected',
        value: calculateIssuesDetected(),
        icon: 'times-circle',
        borderColor: 'border-orange-500',
        bgColor: 'bg-orange-500'
      },
    ]);

    // State for inspections
    const inspections = ref([]);
    const products = ref([]);
    const searchQuery = ref('');
    const resultFilter = ref('');
    const currentPage = ref(1);
    const pageSize = ref(10);

    // Modal state
    const showModal = ref(false);
    const showDeleteModal = ref(false);
    const isEditing = ref(false);
    const currentInspection = ref({
      product_id: '',
      inspection_date: '',
      result: 'Passed'
    });
    const inspectionToDelete = ref(null);

    // Utility functions for stats calculations
    const calculatePassRate = () => {
      if (inspections.value.length === 0) return 0;
      const passed = inspections.value.filter(i => i.result === 'Passed').length;
      return Math.round((passed / inspections.value.length) * 100);
    };

    const calculateIssuesDetected = () => {
      return inspections.value.filter(i => i.result === 'Failed').length;
    };

    // Export function
    const exportCsv = async () => {
      try {
        console.log('Starting export process...');
        // Get current user for debugging
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('Current user:', user);
        
        await QualityControlService.exportCsv();
        toast.success('Export started. File will download shortly.');
      } catch (error) {
        console.error('Error exporting data:', error);
        toast.error('Failed to export data');
      }
    };

    // Load data
    const loadData = async () => {
      try {
        const [inspectionsData, productsData] = await Promise.all([
          getInspections(),
          getProductions()
        ]);
        inspections.value = inspectionsData;
        products.value = productsData;
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    onMounted(loadData);

    // Computed properties
    const filteredInspections = computed(() => {
      let filtered = [...inspections.value];
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(inspection => 
          inspection.inspection_id.toLowerCase().includes(query) ||
          inspection.product?.name.toLowerCase().includes(query)
        );
      }
      
      if (resultFilter.value) {
        filtered = filtered.filter(inspection => 
          inspection.result === resultFilter.value
        );
      }
      
      return filtered;
    });

    // Modal handlers
    const showCreateModal = () => {
      isEditing.value = false;
      currentInspection.value = {
        product_id: '',
        inspection_date: format(new Date(), 'yyyy-MM-dd'),
        result: 'Passed'
      };
      showModal.value = true;
    };

    const showEditModal = (inspection) => {
      isEditing.value = true;
      currentInspection.value = { 
        ...inspection,
        product_id: inspection.product_id || inspection.productId?.toString() || ''
      };
      showModal.value = true;
    };

    const viewDetails = (inspection) => {
      isEditing.value = true;
      currentInspection.value = { 
        ...inspection,
        product_id: inspection.product_id || inspection.productId?.toString() || ''
      };
      showModal.value = true;
    };

    const hideModal = () => {
      showModal.value = false;
      currentInspection.value = {
        product_id: '',
        inspection_date: '',
        result: 'Passed'
      };
    };

    const confirmDelete = (inspection) => {
      inspectionToDelete.value = inspection;
      showDeleteModal.value = true;
    };

    const hideDeleteModal = () => {
      showDeleteModal.value = false;
      inspectionToDelete.value = null;
    };

    // CRUD operations
    const saveInspection = async () => {
      if (!currentInspection.value.product_id) {
        toast.error('Please select a product');
        return;
      }
      if (!currentInspection.value.inspection_date) {
        toast.error('Please select an inspection date');
        return;
      }

      try {
        console.log('Saving inspection with data:', JSON.stringify(currentInspection.value, null, 2));
        
        // Create a copy to avoid modifying the currentInspection directly
        const inspectionData = {
          ...currentInspection.value,
          // Ensure product_id is handled correctly
          product_id: currentInspection.value.product_id.toString()
        };
        
        console.log('Processed inspection data:', JSON.stringify(inspectionData, null, 2));
        
        if (isEditing.value) {
          const result = await updateInspection(inspectionData.id, inspectionData);
          console.log('Update result:', result);
          toast.success('Inspection updated successfully');
        } else {
          const result = await createInspection(inspectionData);
          console.log('Create result:', result);
          toast.success('Inspection created successfully');
        }
        await loadData();
        hideModal();
      } catch (error) {
        console.error('Error saving inspection:', error);
        toast.error(error.message || 'Error saving inspection');
      }
    };

    const deleteInspection = async () => {
      try {
        await deleteInspectionApi(inspectionToDelete.value.id);
        await loadData();
        hideDeleteModal();
      } catch (error) {
        console.error('Error deleting inspection:', error);
      }
    };

    // Utility functions
    const formatDate = (date) => {
      try {
        return format(new Date(date), 'yyyy-MM-dd');
      } catch {
        return date;
      }
    };

    const getResultClass = (result) => {
      switch (result) {
        case 'Passed':
          return 'bg-green-100 text-green-800';
        case 'Failed':
          return 'bg-red-100 text-red-800';
        case 'Passed with Notes':
          return 'bg-yellow-100 text-yellow-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    // Pagination handlers
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const nextPage = () => {
      if (currentPage.value * pageSize.value < filteredInspections.value.length) {
        currentPage.value++;
      }
    };

    return {
      // State
      inspections,
      products,
      searchQuery,
      resultFilter,
      currentPage,
      pageSize,
      showModal,
      showDeleteModal,
      isEditing,
      currentInspection,
      
      // Computed
      filteredInspections,
      
      // Methods
      showCreateModal,
      showEditModal,
      viewDetails,
      hideModal,
      confirmDelete,
      hideDeleteModal,
      saveInspection,
      deleteInspection,
      formatDate,
      getResultClass,
      prevPage,
      nextPage,
      exportCsv,
      
      // Keep existing returns
      stats
    };
  }
};
</script> 

<style>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style> 