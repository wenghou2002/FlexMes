import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/styles.css';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

// Import animation libraries
import AOS from 'aos';
import 'aos/dist/aos.css';
import gsap from 'gsap';

// Import tooltip library
import VueTippy from 'vue-tippy';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

// Import FontAwesome icons
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faDownload, 
  faSpinner, 
  faExclamationTriangle,
  faCheckCircle,
  faHome,
  faIndustry,
  faCheckSquare,
  faAngleLeft,
  faAngleRight,
  faBell,
  faUser,
  faChartLine,
  faTable,
  faClock,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

// Add the icons to the library
library.add(
  faPlus, 
  faEdit, 
  faTrash, 
  faDownload, 
  faSpinner, 
  faExclamationTriangle,
  faCheckCircle,
  faHome,
  faIndustry,
  faCheckSquare,
  faAngleLeft,
  faAngleRight,
  faBell,
  faUser,
  faChartLine,
  faTable,
  faClock,
  faExclamationCircle
);

// Initialize AOS animation library
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true
});

// Make gsap available globally
window.gsap = gsap;

// Create Vue App
const app = createApp(App);

// Register FontAwesome globally
app.component('font-awesome-icon', FontAwesomeIcon);

// Create and use Pinia for state management
const pinia = createPinia();
app.use(pinia);

// Use router
app.use(router);

// Use Toast notifications
app.use(Toast, {
  transition: "Vue-Toastification__bounce",
  maxToasts: 5,
  newestOnTop: true
});

// Use Tippy.js for tooltips
app.use(VueTippy, {
  defaultProps: {
    arrow: true,
    theme: 'light',
    animation: 'shift-away',
    placement: 'bottom'
  }
});

// Mount the app
app.mount('#app');
