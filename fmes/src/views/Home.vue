<template>
  <div class="container mx-auto px-4 py-6">
    <div class="bg-white shadow rounded-lg p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Welcome to MES Dashboard</h1>
      
      <div class="bg-teal-50 border-l-4 border-teal-500 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <font-awesome-icon icon="info-circle" class="h-5 w-5 text-teal-500" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-teal-700">
              You are successfully logged in as <strong>{{ username }}</strong>.
              Navigate using the sidebar to access different sections of the dashboard.
            </p>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          v-for="(card, index) in quickAccessCards" 
          :key="index"
          class="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-teal-500 hover:shadow-md transition-all duration-200"
        >
          <div class="text-gray-700 mb-4">
            <font-awesome-icon :icon="card.icon" class="text-teal-600 text-2xl" />
          </div>
          <h3 class="text-lg font-medium text-gray-800 mb-2">{{ card.title }}</h3>
          <p class="text-gray-600 mb-4">{{ card.description }}</p>
          <router-link 
            :to="card.link" 
            class="text-teal-600 hover:text-teal-700 font-medium flex items-center"
          >
            Go to {{ card.title }}
            <font-awesome-icon icon="arrow-right" class="ml-2" />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { 
  faInfoCircle, 
  faArrowRight,
  faIndustry, 
  faCheckSquare, 
  faChartLine 
} from '@fortawesome/free-solid-svg-icons';

// Add icons to the library
library.add(
  faInfoCircle, 
  faArrowRight,
  faIndustry, 
  faCheckSquare, 
  faChartLine
);

export default {
  name: 'HomeView',
  components: {
    FontAwesomeIcon
  },
  setup() {
    const authStore = useAuthStore();
    
    const username = computed(() => authStore.username);
    
    const quickAccessCards = [
      {
        title: 'Production',
        description: 'Monitor and manage production processes, schedules, and equipment status.',
        icon: 'industry',
        link: '/production'
      },
      {
        title: 'Quality Control',
        description: 'Track quality metrics, inspect reports, and manage quality issues.',
        icon: 'check-square',
        link: '/quality-control'
      },
      {
        title: 'Analytics',
        description: 'View performance metrics, trends, and generate custom reports.',
        icon: 'chart-line',
        link: '/analytics'
      }
    ];
    
    return {
      username,
      quickAccessCards
    };
  }
};
</script> 