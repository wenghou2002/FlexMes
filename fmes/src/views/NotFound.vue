<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-teal-600">404</h1>
      <h2 class="text-3xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
      <p class="text-lg text-gray-600 mt-2">The page you're looking for doesn't exist or has been moved.</p>
      
      <div class="mt-8">
        <router-link 
          to="/" 
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          <font-awesome-icon icon="home" class="mr-2" />
          Return Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

// Add icons to the library
library.add(faHome);

export default {
  name: 'NotFoundView',
  components: {
    FontAwesomeIcon
  }
};
</script> 