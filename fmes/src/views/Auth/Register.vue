<template>
  <AuthLayout title="Create a new account">
    <div class="space-y-6">
      <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <font-awesome-icon icon="exclamation-circle" class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <div v-if="typeof error === 'object'">
              <div v-if="error.general && error.general.length > 0">
                <p v-for="(msg, index) in error.general" :key="'gen-'+index" class="text-sm text-red-700">{{ msg }}</p>
              </div>
              <div v-if="error.password && error.password.length > 0">
                <p v-for="(msg, index) in error.password" :key="'pwd-'+index" class="text-sm text-red-700">{{ msg }}</p>
              </div>
            </div>
            <p v-else class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>
      
      <form @submit.prevent="handleRegister" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <div class="mt-1">
            <input 
              id="username" 
              v-model="form.username" 
              name="username" 
              type="text" 
              required 
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            />
          </div>
          <div class="mt-1 text-xs text-gray-600">
            Username must be between 4 and 30 characters
          </div>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <div class="mt-1">
            <input 
              id="email" 
              v-model="form.email" 
              name="email" 
              type="email" 
              required 
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <div class="mt-1 relative">
            <input 
              id="password" 
              v-model="form.password" 
              name="password" 
              :type="showPassword ? 'text' : 'password'" 
              required 
              autocomplete="new-password"
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm pr-10"
            />
            <button 
              type="button" 
              @click="showPassword = !showPassword" 
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
            >
              <font-awesome-icon :icon="showPassword ? 'eye-slash' : 'eye'" class="h-5 w-5" />
            </button>
          </div>
          <div class="mt-1 text-xs text-gray-600">
            Password must be at least 8 characters long
          </div>
        </div>

        <div>
          <label for="passwordConfirm" class="block text-sm font-medium text-gray-700">Confirm Password</label>
          <div class="mt-1 relative">
            <input 
              id="passwordConfirm" 
              v-model="form.passwordConfirm" 
              name="passwordConfirm" 
              :type="showConfirmPassword ? 'text' : 'password'" 
              required 
              autocomplete="new-password"
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm pr-10"
            />
            <button 
              type="button" 
              @click="showConfirmPassword = !showConfirmPassword" 
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
            >
              <font-awesome-icon :icon="showConfirmPassword ? 'eye-slash' : 'eye'" class="h-5 w-5" />
            </button>
          </div>
          <div v-if="form.password && form.passwordConfirm && form.password !== form.passwordConfirm" class="mt-1 text-xs text-red-600">
            Passwords do not match
          </div>
        </div>

        <div>
          <button 
            type="submit" 
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading" class="inline-flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
            <span v-else>Create account</span>
          </button>
        </div>
      </form>

      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Already have an account?</span>
          </div>
        </div>

        <div class="mt-6">
          <router-link 
            to="/login" 
            class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Sign in
          </router-link>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from 'vue-toastification';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faExclamationCircle, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

// Add icons to the library
library.add(faExclamationCircle, faEye, faEyeSlash);

export default {
  name: 'RegisterView',
  components: {
    AuthLayout,
    FontAwesomeIcon,
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const toast = useToast();
    
    const form = ref({
      username: '',
      email: '',
      password: '',
      passwordConfirm: ''
    });
    
    const loading = ref(false);
    const error = ref('');
    const isPasswordValid = ref(true);
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    
    const isFormValid = computed(() => {
      return (
        form.value.username.trim() !== '' &&
        form.value.email.trim() !== '' &&
        form.value.password !== '' &&
        form.value.password === form.value.passwordConfirm
      );
    });
    
    const handleRegister = async () => {
      // Validate password match
      if (form.value.password !== form.value.passwordConfirm) {
        error.value = 'Passwords do not match';
        return;
      }
      
      loading.value = true;
      error.value = '';
      
      try {
        await authStore.register({
          username: form.value.username,
          email: form.value.email,
          password: form.value.password
        });
        
        toast.success('Account created successfully! You can now login.');
        router.push('/login');
      } catch (err) {
        if (err.response && err.response.data) {
          error.value = err.response.data;
        } else {
          error.value = err.message || 'Failed to register. Please try again.';
        }
        console.error('Registration error:', err);
      } finally {
        loading.value = false;
      }
    };
    
    return {
      form,
      loading,
      error,
      isPasswordValid,
      isFormValid,
      showPassword,
      showConfirmPassword,
      handleRegister
    };
  }
};
</script> 