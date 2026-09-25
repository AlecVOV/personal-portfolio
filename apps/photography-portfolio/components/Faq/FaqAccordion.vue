<template>
  <div class="space-y-4">
    <div 
      v-for="(item, index) in faqItems" 
      :key="index"
      class="border border-primary-200 dark:border-primary-700 rounded-sm overflow-hidden"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :visibleOnce="{ opacity: 1, y: 0, transition: { delay: 100 * index, duration: 600 } }"
    >
      <button 
        @click="toggleItem(index)"
        class="w-full flex items-center justify-between p-4 md:p-6 text-left font-serif focus:outline-none"
        :class="activeIndex === index ? 'bg-primary-100 dark:bg-primary-700' : 'bg-white dark:bg-primary-800'"
      >
        <span class="text-lg">{{ item.question }}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-5 w-5 transition-transform duration-300"
          :class="activeIndex === index ? 'transform rotate-180' : ''"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <Transition name="fade">
        <div v-if="activeIndex === index" class="p-4 md:p-6 border-t border-primary-200 dark:border-primary-700">
          <p>{{ item.answer }}</p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  faqItems: {
    type: Array,
    required: true
  }
});

const activeIndex = ref(0);

const toggleItem = (index) => {
  if (activeIndex.value === index) {
    // Allow closing if it's already open
    activeIndex.value = null;
  } else {
    activeIndex.value = index;
  }
};
</script>