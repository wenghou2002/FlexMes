<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Production Dashboard</h1>
      <div class="flex space-x-2">
        <button @click="showCreateModal" class="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors">
          <font-awesome-icon icon="plus" class="mr-2" />
          New Production Order
        </button>
        <button @click="exportCsv" class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
          <font-awesome-icon icon="download" class="mr-2" />
          Export
        </button>
      </div>
    </div>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div v-for="(stat, index) in stats.slice(0, 3)" :key="index" class="bg-white p-6 rounded-lg shadow-sm border-l-4" :class="stat.borderColor">
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
    
    
    <!-- Production Table -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 class="text-lg font-medium text-gray-800">Production Orders</h2>
        <div class="flex items-center">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search..." 
            class="px-4 py-2 border border-gray-300 rounded-lg mr-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <select 
            v-model="statusFilter" 
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
          </select>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="order in filteredProductionOrders" :key="order.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ order.displayId || order.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ order.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ order.material || 'N/A' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(order.createdAt) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(order.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ order.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div class="bg-teal-600 h-2.5 rounded-full" :style="`width: ${getProgressPercent(order)}%`"></div>
                </div>
                <span class="text-xs text-gray-500">{{ getProgressPercent(order) }}%</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="viewDetails(order)" class="text-teal-600 hover:text-teal-900 mr-3">
                  <font-awesome-icon icon="eye" />
                </button>
                <button @click="showEditModal(order)" class="text-blue-600 hover:text-blue-900 mr-3">
                  <font-awesome-icon icon="edit" />
                </button>
                <button @click="confirmDelete(order)" class="text-red-600 hover:text-red-900">
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
            Showing <span class="font-medium">{{ filteredProductionOrders.length }}</span> records
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
              :disabled="currentPage * pageSize >= filteredProductionOrders.length"
              class="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create Modal -->
    <transition name="modal-fade">
      <div v-if="showCreateModalVisible" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg w-full max-w-md shadow-2xl">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Create New Production</h2>
            <button @click="hideCreateModal" class="text-gray-500 hover:text-gray-700">
              <font-awesome-icon icon="times" />
            </button>
          </div>

          <!-- Form for New Production -->
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Name:</label>
            <input 
              v-model="newProduction.name" 
              type="text" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
              required
              placeholder="Enter product name"
            >
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Material:</label>
            <input 
              v-model="newProduction.material" 
              type="text" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter material type"
            >
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Status:</label>
            <select 
              v-model="newProduction.status" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <!-- Modal Buttons -->
          <div class="flex justify-end space-x-3 mt-6">
            <button 
              @click="hideCreateModal" 
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="createProductionOrder" 
              class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- Edit Modal -->
    <transition name="modal-fade">
      <div v-if="showEditModalVisible" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg w-full max-w-md shadow-2xl">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Edit Production</h2>
            <button @click="hideEditModal" class="text-gray-500 hover:text-gray-700">
              <font-awesome-icon icon="times" />
            </button>
          </div>

          <!-- Form for Editing Production -->
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Name:</label>
            <input 
              v-model="editedProduction.name" 
              type="text" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
              required
              placeholder="Enter product name"
            >
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Material:</label>
            <input 
              v-model="editedProduction.material" 
              type="text" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter material type"
            >
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Status:</label>
            <select 
              v-model="editedProduction.status" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <!-- Modal Buttons -->
          <div class="flex justify-end space-x-3 mt-6">
            <button 
              @click="hideEditModal" 
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="updateProductionOrder" 
              class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- Delete Confirmation Modal -->
    <transition name="modal-fade">
      <div v-if="showDeleteModalVisible" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg w-full max-w-md shadow-2xl">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Confirm Delete</h2>
            <p class="mt-2 text-gray-600">Are you sure you want to delete this production order? This action cannot be undone.</p>
          </div>

          <div class="flex justify-end space-x-3">
            <button 
              @click="hideDeleteModal" 
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="deleteProductionOrder" 
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- Loading Indicator -->
    <div v-if="loading" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
        <font-awesome-icon icon="spinner" spin size="3x" class="text-teal-600 mb-4" />
        <p class="text-gray-700 text-lg">Loading data...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
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
  faTimes,
  faBoxes,
  faSpinner,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import ProductionStatusChart from '@/components/charts/ProductionStatusChart.vue';
import MachineUtilizationChart from '@/components/charts/MachineUtilizationChart.vue';
import { getProductions, createProduction, updateProduction, deleteProduction as deleteProductionApi } from '@/services/productionService';
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
  faTimes,
  faBoxes,
  faSpinner,
  faCheck
);

export default {
  name: 'ProductionView',
  components: {
    FontAwesomeIcon,
    ProductionStatusChart,
    MachineUtilizationChart
  },
  setup() {
    const toast = useToast();
    const loading = ref(false);
    const productions = ref([]);
    const searchQuery = ref('');
    const statusFilter = ref('');
    const currentPage = ref(1);
    const pageSize = ref(10);
    
    // Modals
    const showCreateModalVisible = ref(false);
    const showEditModalVisible = ref(false);
    const showDeleteModalVisible = ref(false);
    
    // Form data
    const newProduction = ref({
      name: '',
      material: '',
      status: 'In Progress'
    });
    
    const editedProduction = ref({
      id: null,
      name: '',
      material: '',
      status: 'In Progress'
    });
    
    const productionToDelete = ref(null);
    
    // Stats cards data
    const stats = ref([
      {
        title: 'Total Orders',
        value: '0',
        icon: 'boxes',
        borderColor: 'border-blue-500',
        bgColor: 'bg-blue-500'
      },
      {
        title: 'In Progress',
        value: '0',
        icon: 'spinner',
        borderColor: 'border-orange-500',
        bgColor: 'bg-orange-500'
      },
      {
        title: 'Completed',
        value: '0',
        icon: 'check',
        borderColor: 'border-green-500',
        bgColor: 'bg-green-500'
      }
    ]);

    // Filter production orders
    const filteredProductionOrders = computed(() => {
      let filtered = [...productions.value];
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(prod => 
          prod.name.toLowerCase().includes(query) ||
          prod.material?.toLowerCase().includes(query)
        );
      }
      
      if (statusFilter.value) {
        filtered = filtered.filter(prod => 
          prod.status === statusFilter.value
        );
      }
      
      return filtered;
    });
    
    // Load production data
    const loadData = async () => {
      loading.value = true;
      try {
        const data = await getProductions();
        productions.value = data;
        updateStats();
      } catch (error) {
        console.error('Error loading productions:', error);
        toast.error('Failed to load production data');
      } finally {
        loading.value = false;
      }
    };
    
    // Update stats based on production data
    const updateStats = () => {
      const total = productions.value.length;
      const inProgress = productions.value.filter(p => p.status === 'In Progress').length;
      const completed = productions.value.filter(p => p.status === 'Completed').length;
      
      stats.value[0].value = total.toString();
      stats.value[1].value = inProgress.toString();
      stats.value[2].value = completed.toString();
    };
    
    // Format date
    const formatDate = (date) => {
      try {
        return format(new Date(date), 'yyyy-MM-dd');
      } catch {
        return date;
      }
    };
    
    // Get status class for coloring
    const getStatusClass = (status) => {
      switch (status) {
        case 'Completed':
          return 'bg-green-100 text-green-800';
        case 'In Progress':
          return 'bg-blue-100 text-blue-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };
    
    // Get progress percentage
    const getProgressPercent = (order) => {
      switch (order.status) {
        case 'Completed':
          return 100;
        case 'In Progress':
          return 50;
        default:
          return 0;
      }
    };
    
    // Modal functions
    const showCreateModal = () => {
      newProduction.value = {
        name: '',
        material: '',
        status: 'In Progress'
      };
      showCreateModalVisible.value = true;
    };
    
    const hideCreateModal = () => {
      showCreateModalVisible.value = false;
      newProduction.value = {
        name: '',
        material: '',
        status: 'In Progress'
      };
    };
    
    const showEditModal = (order) => {
      editedProduction.value = { ...order };
      showEditModalVisible.value = true;
    };
    
    const hideEditModal = () => {
      showEditModalVisible.value = false;
      editedProduction.value = {
        id: null,
        name: '',
        material: '',
        status: 'In Progress'
      };
    };
    
    const confirmDelete = (order) => {
      productionToDelete.value = order;
      showDeleteModalVisible.value = true;
    };
    
    const hideDeleteModal = () => {
      productionToDelete.value = null;
      showDeleteModalVisible.value = false;
    };
    
    // CRUD operations
    const createProductionOrder = async () => {
      if (!newProduction.value.name) {
        toast.error('Please enter a product name');
        return;
      }
      
      loading.value = true;
      try {
        console.log('Creating production with data:', JSON.stringify(newProduction.value, null, 2));
        
        // Make a copy to ensure we're not modifying the original object
        const productionData = {
          name: newProduction.value.name,
          material: newProduction.value.material || '',
          status: newProduction.value.status
        };
        
        console.log('Processed production data:', JSON.stringify(productionData, null, 2));
        
        const result = await createProduction(productionData);
        console.log('Create result:', result);
        
        toast.success('Production record created successfully');
        hideCreateModal();
        await loadData();
      } catch (error) {
        console.error('Error creating production:', error);
        toast.error(error.message || 'Failed to create production record');
      } finally {
        loading.value = false;
      }
    };
    
    const updateProductionOrder = async () => {
      if (!editedProduction.value.name) {
        toast.error('Please enter a product name');
        return;
      }
      
      loading.value = true;
      try {
        console.log('Updating production with data:', JSON.stringify(editedProduction.value, null, 2));
        
        // Make a copy to ensure we're not modifying the original object
        const productionData = {
          name: editedProduction.value.name,
          material: editedProduction.value.material || '',
          status: editedProduction.value.status
        };
        
        console.log('Processed production data:', JSON.stringify(productionData, null, 2));
        
        const result = await updateProduction(editedProduction.value.id, productionData);
        console.log('Update result:', result);
        
        toast.success('Production record updated successfully');
        hideEditModal();
        await loadData();
      } catch (error) {
        console.error('Error updating production:', error);
        toast.error(error.message || 'Failed to update production record');
      } finally {
        loading.value = false;
      }
    };
    
    const deleteProductionOrder = async () => {
      if (!productionToDelete.value) return;
      
      loading.value = true;
      try {
        await deleteProductionApi(productionToDelete.value.id);
        toast.success('Production record deleted successfully');
        hideDeleteModal();
        await loadData();
      } catch (error) {
        console.error('Error deleting production:', error);
        toast.error('Failed to delete production record');
      } finally {
        loading.value = false;
      }
    };
    
    // Pagination
    const nextPage = () => {
      if (currentPage.value * pageSize.value < filteredProductionOrders.value.length) {
        currentPage.value++;
      }
    };
    
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };
    
    // Export to CSV
    const exportCsv = () => {
      try {
        // Create CSV content
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Product,Material,Date,Status\n";
        
        filteredProductionOrders.value.forEach(order => {
          const row = [
            order.id || order.product_id,
            (order.name || order.product).replace(",", " "),
            (order.material || 'N/A').replace(",", " "),
            formatDate(order.created_at) || order.startDate,
            order.status
          ];
          csvContent += row.join(",") + "\n";
        });
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `production_data_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        document.body.removeChild(link);
        
        toast.success('CSV file downloaded successfully');
      } catch (error) {
        console.error('Error exporting CSV:', error);
        toast.error('Failed to export data');
      }
    };
    
    // View details
    const viewDetails = (order) => {
      toast.info(`Viewing details for ${order.name || order.product}`);
      // Could implement a detailed view modal here
    };
    
    // Load data on component mount
    onMounted(() => {
      loadData();
    });

    return {
      stats,
      productions,
      filteredProductionOrders,
      loading,
      searchQuery,
      statusFilter,
      currentPage,
      pageSize,
      showCreateModalVisible,
      showEditModalVisible,
      showDeleteModalVisible,
      newProduction,
      editedProduction,
      getStatusClass,
      getProgressPercent,
      formatDate,
      showCreateModal,
      hideCreateModal,
      showEditModal,
      hideEditModal,
      confirmDelete,
      hideDeleteModal,
      createProductionOrder,
      updateProductionOrder,
      deleteProductionOrder,
      nextPage,
      prevPage,
      exportCsv,
      viewDetails
    };
  }
};
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style> 