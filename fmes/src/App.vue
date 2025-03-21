<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Mobile backdrop overlay -->
    <div 
      v-if="menuVisible" 
      @click="closeMobileMenu"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
    ></div>
    
    <!-- Collapsible Sidebar -->
    <aside 
      :class="[
        'transition-all duration-300 ease-in-out shadow-lg z-50 fixed h-full', 
        isCollapsed ? 'w-20' : 'w-64',
        menuVisible ? 'translate-x-0' : ''
      ]"
      class="bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700"
      v-if="isAuthenticated"
    >
      <div class="p-6 text-white overflow-hidden">
        <div class="flex items-center justify-between">
          <h1 :class="['text-3xl font-bold transition-all duration-300', isCollapsed ? 'scale-0 w-0' : 'scale-100']">
            MES DASHBOARD
          </h1>
          <button 
            @click="toggleSidebar" 
            class="text-white p-2 rounded-full hover:bg-slate-700 transition-colors"
          >
            <font-awesome-icon 
              :icon="isCollapsed ? 'bars' : 'angle-left'"
              class="text-lg"
            />
          </button>
        </div>
      </div>
      
      <nav class="mt-6">
        <ul class="space-y-2 px-3">
          <li v-for="(route, index) in routes" :key="index">
            <router-link
              :to="route.path"
              @click="closeMobileMenu"
              class="flex items-center p-3 text-white rounded-lg transition-all duration-200"
              :class="[
                $route.path === route.path ? 'bg-teal-600 shadow-md' : 'hover:bg-slate-700',
                'group'
              ]"
              v-tooltip="{ content: isCollapsed ? route.name : '', placement: 'right' }"
            >
              <font-awesome-icon
                :icon="route.icon"
                class="text-lg transition-all duration-200" 
                :class="$route.path === route.path ? 'text-white' : 'text-gray-300 group-hover:text-white'"
              />
              <span 
                class="ml-3 whitespace-nowrap transition-all duration-300"
                :class="isCollapsed ? 'opacity-0 w-0' : 'opacity-100'"
              >
                {{ route.name }}
              </span>
            </router-link>
          </li>
        </ul>
      </nav>
      
      <div 
        class="absolute bottom-0 w-full p-4 text-white text-xs text-center transition-opacity duration-300"
        :class="isCollapsed ? 'opacity-0' : 'opacity-70'"
      >
        MES Dashboard v1.0.0
      </div>
    </aside>

    <!-- Main Content with sidebar offset -->
    <div 
      :class="[
        'transition-all duration-300 ease-in-out flex-1', 
        isAuthenticated && isCollapsed ? 'sm:ml-20' : (isAuthenticated ? 'sm:ml-64' : 'ml-0')
      ]"
      class="ml-0 w-full"
    >
      <header v-if="isAuthenticated" class="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div class="flex items-center">
          <button 
            @click="toggleSidebar"
            class="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors sm:hidden"
          >
            <font-awesome-icon :icon="menuVisible ? 'times' : 'bars'" class="text-gray-600" />
          </button>
          <h2 class="text-xl font-semibold text-gray-800">
            {{ currentPageTitle }}
          </h2>
        </div>
        <div class="flex items-center space-x-4">
          <button class="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <font-awesome-icon icon="bell" class="text-gray-600" />
          </button>
          
          <!-- User Menu -->
          <div class="relative" ref="userMenuRef">
            <!-- User Avatar/Button -->
            <button 
              @click="toggleUserMenu" 
              class="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center"
            >
              <span class="mr-2 text-sm font-medium text-gray-700 hidden sm:block">{{ username }}</span>
              <font-awesome-icon icon="user-circle" class="text-gray-600" />
            </button>
            
            <!-- Dropdown Menu -->
            <div 
              v-if="userMenuVisible"
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
            >
              <div class="px-4 py-2 text-xs text-gray-500">
                Logged in as <span class="font-medium">{{ username }}</span>
              </div>
              <div class="border-t border-gray-100"></div>
              <a 
                href="#" 
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click.prevent="logout"
              >
                <font-awesome-icon icon="sign-out-alt" class="mr-2" />
                Logout
              </a>
            </div>
          </div>
        </div>
      </header>
      
      <main class="p-6 animate-fadeIn">
        <router-view v-slot="{ Component }">
          <transition 
            name="page-transition" 
            mode="out-in"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { 
  faHome, 
  faIndustry, 
  faCheckSquare, 
  faAngleLeft, 
  faAngleRight,
  faBars,
  faBell,
  faUser,
  faUserCircle,
  faSignOutAlt,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from 'vue-toastification';

// Add icons to the library
library.add(
  faHome, 
  faIndustry, 
  faCheckSquare, 
  faAngleLeft, 
  faAngleRight,
  faBars,
  faBell,
  faUser,
  faUserCircle,
  faSignOutAlt,
  faTimes
);

export default {
  name: 'App',
  components: {
    FontAwesomeIcon
  },
  setup() {
    const isCollapsed = ref(false);
    const menuVisible = ref(false);
    const userMenuVisible = ref(false);
    const userMenuRef = ref(null);
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    const toast = useToast();

    const routes = [
      { name: 'Home', path: '/', icon: 'home' },
      { name: 'Production', path: '/production', icon: 'industry' },
      { name: 'Quality Control', path: '/quality-control', icon: 'check-square' }
    ];

    const currentPageTitle = computed(() => {
      const currentRoute = routes.find(r => r.path === route.path);
      return currentRoute ? currentRoute.name : 'Dashboard';
    });

    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const username = computed(() => authStore.username);

    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value;
      // For mobile: also toggle menu visibility when sidebar button is clicked
      if (window.innerWidth <= 640) {
        menuVisible.value = !menuVisible.value;
      }
    };

    const closeMobileMenu = () => {
      if (window.innerWidth <= 640) {
        menuVisible.value = false;
      }
    };

    const toggleUserMenu = () => {
      userMenuVisible.value = !userMenuVisible.value;
    };

    const closeUserMenu = (event) => {
      if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
        userMenuVisible.value = false;
      }
    };

    const logout = async () => {
      try {
        await authStore.logout();
        router.push('/login');
        toast.success('Logged out successfully');
      } catch (error) {
        console.error('Logout error:', error);
        toast.error('Failed to logout');
      }
    };

    // Close user menu when clicking outside
    onMounted(() => {
      document.addEventListener('click', closeUserMenu);
    });

    onUnmounted(() => {
      document.removeEventListener('click', closeUserMenu);
    });

    return {
      isCollapsed,
      menuVisible,
      userMenuVisible,
      userMenuRef,
      routes,
      currentPageTitle,
      isAuthenticated,
      username,
      toggleSidebar,
      closeMobileMenu,
      toggleUserMenu,
      logout
    };
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

:root {
  --primary-color: #3b82f6;
  --secondary-color: #0f766e;
  --accent-color: #0d9488;
  --background-color: #f9fafb;
  --text-color: #1f2937;
  --sidebar-width: 16rem;
  --sidebar-collapsed-width: 5rem;
  --transition-duration: 0.3s;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: 'Poppins', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  overflow-x: hidden;
}

/* Animations */
.animate-fadeIn {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Page transitions */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.page-transition-enter-from,
.page-transition-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Tooltip styles */
.v-tooltip {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.75rem;
  z-index: 9999;
}

/* Media Queries for responsive sidebar */
@media (max-width: 640px) {
  aside {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 50;
    transform: translateX(-100%);
  }
  
  aside.translate-x-0 {
    transform: translateX(0);
  }
  
  .sm\:ml-20, 
  .sm\:ml-64 {
    margin-left: 0 !important;
  }
  
  header {
    padding-left: 1rem;
  }
}
</style>
