import type { Section } from '~/types/portfolio'

export const usePortfolio = () => {
  const currentSection = ref<Section>('About')
  const selectedCategory = ref<string>('All')
  const isSidebarOpen = ref<boolean>(false)

  const sections: Section[] = ['About', 'Resume', 'Portfolio', 'Blog', 'Contact']

  // Initialize sidebar state based on screen size
  const initializeSidebarState = () => {
    if (process.client) {
      isSidebarOpen.value = window.innerWidth >= 768
    }
  }

  // Computed properties for dynamic classes
  const sidebarClasses = computed(() => ({
    'translate-x-0 w-64 sm:w-72 md:w-80': isSidebarOpen.value,
    '-translate-x-full': !isSidebarOpen.value,
    'md:translate-x-0': true
  }))

  const mainClasses = computed(() => [
    isSidebarOpen.value ? 'md:ml-80' : 'ml-0'
  ])

  // Navigation methods
  const navigateToSection = (section: Section) => {
    currentSection.value = section
  }

  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  // Handle window resize
  const handleResize = () => {
    if (process.client) {
      if (window.innerWidth <= 768) {
        isSidebarOpen.value = false
      } else {
        isSidebarOpen.value = true
      }
    }
  }

  // Lifecycle management
  onMounted(() => {
    initializeSidebarState()
    if (process.client) {
      window.addEventListener('resize', handleResize)
    }
  })

  onUnmounted(() => {
    if (process.client) {
      window.removeEventListener('resize', handleResize)
    }
  })

  return {
    currentSection,
    selectedCategory,
    isSidebarOpen,
    sections,
    sidebarClasses,
    mainClasses,
    navigateToSection,
    toggleSidebar,
    initializeSidebarState
  }
}
