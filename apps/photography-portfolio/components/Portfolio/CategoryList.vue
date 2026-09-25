<template>
  <div class="flex flex-wrap justify-center gap-4 mb-12">
    <button
      v-for="category in categories"
      :key="category.id"
      @click="$emit('filter-change', category.id)"
      :class="[
        'px-6 py-2 rounded-full transition-all duration-300 font-medium',
        activeCategory === category.id
          ? 'bg-accent-600 text-white shadow-lg scale-105'
          : 'bg-white dark:bg-primary-800 text-primary-700 dark:text-primary-200 hover:bg-accent-100 dark:hover:bg-primary-700 hover:scale-105'
      ]"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :visibleOnce="{ 
        opacity: 1, 
        y: 0, 
        transition: { 
          delay: 50 * categories.indexOf(category), 
          duration: 400 
        } 
      }"
    >
      {{ category.name }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  activeCategory: {
    type: [String, Number],
    default: 'all'
  }
})

defineEmits(['filter-change'])
</script>