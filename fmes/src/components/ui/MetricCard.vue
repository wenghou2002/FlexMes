<template>
  <div class="bg-white p-6 rounded-lg shadow border-l-4" :class="borderColorClass">
    <div class="flex items-center">
      <div class="p-3 rounded-full mr-4" :class="iconBgColorClass">
        <font-awesome-icon :icon="icon" class="text-white text-xl" />
      </div>
      <div>
        <p class="text-sm text-gray-500 font-medium">{{ title }}</p>
        <p class="text-2xl font-bold">{{ value }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'MetricCard',
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: 'blue',
      validator: (value: string) => ['blue', 'green', 'red', 'yellow', 'indigo', 'purple', 'pink'].includes(value)
    }
  },
  setup(props) {
    const borderColorClass = computed(() => {
      const colorMap: Record<string, string> = {
        'blue': 'border-blue-500',
        'green': 'border-green-500',
        'red': 'border-red-500',
        'yellow': 'border-yellow-500',
        'indigo': 'border-indigo-500',
        'purple': 'border-purple-500',
        'pink': 'border-pink-500'
      };
      return colorMap[props.color] || 'border-gray-500';
    });
    
    const iconBgColorClass = computed(() => {
      const bgColorMap: Record<string, string> = {
        'blue': 'bg-blue-500',
        'green': 'bg-green-500',
        'red': 'bg-red-500',
        'yellow': 'bg-yellow-500',
        'indigo': 'bg-indigo-500',
        'purple': 'bg-purple-500',
        'pink': 'bg-pink-500'
      };
      return bgColorMap[props.color] || 'bg-gray-500';
    });
    
    return {
      borderColorClass,
      iconBgColorClass
    };
  }
});
</script> 