<template>
  <div class="min-h-screen bg-eerie-black font-poppins text-white">
    <!-- Sidebar Component -->    <Sidebar 
      :is-open="isSidebarOpen"
      :current-section="currentSection"
      :profile="profile"
      :social-links="socialLinks"
      class="fixed top-0 left-0 h-full z-20 transition-all duration-300"
      :class="sidebarClasses"
    />

    <!-- Main Content -->    
     
    <main class="transition-all duration-300 p-6 md:p-8" :class="mainClasses">
      <!-- Error Boundary -->
      <ErrorBoundary :error="error" @clear="clearError" />

      <!-- Loading State -->
      <LoadingSpinner v-if="isLoading" message="Loading content..." type="content" />      
      
      <!-- Navigation -->
    <nav class="mb-8" role="navigation" aria-label="Main navigation">
            <!-- Desktop Navigation -->
      <ul class="hidden md:flex gap-4 flex-wrap" role="tablist">
        <li v-for="section in sections.filter(s => s !== 'Blog')" :key="section" role="presentation">
          <button 
            @click="currentSection = section"
            :aria-selected="currentSection === section"
            :aria-controls="`${section.toLowerCase()}-panel`"
            role="tab"
            class="px-4 py-2 rounded-lg transition-colors"
            :class="currentSection === section ? 'bg-orange-yellow text-white' : 'text-gray-400 hover:text-white'"
          >
            {{ section }}
          </button>
        </li>
        
        <!-- Add Blog as a link -->
        <li role="presentation">
          <NuxtLink
            to="/blog"
            class="inline-block px-4 py-2 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            My Blog
          </NuxtLink>
        </li>
      </ul>
      
      <!-- Mobile Navigation -->
      <div class="md:hidden">
        <label for="mobile-nav" class="sr-only">Select section</label>
        <select 
          id="mobile-nav"
          v-model="currentSection" 
          class="w-full p-2 bg-jet text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-yellow text-base"
          aria-label="Navigate to section"
        >
          <option v-for="section in sections.filter(s => s !== 'Blog')" :key="section" :value="section" class="text-sm">
            {{ section }}
          </option>
          <option value="blog-link" class="text-sm">Blog</option>
        </select>
      </div>
    </nav>

      <!-- Content Sections -->
      <TransitionGroup name="fade" mode="out-in">        
        
        <!-- About Section -->
        <section 
          v-if="currentSection === 'About'" 
          key="about" 
          class="space-y-8"
          id="about-panel"
          role="tabpanel"
          aria-labelledby="about-tab"
        >
          <h2 class="text-3xl font-semibold">About Me</h2>
          <p class="text-gray-300 leading-relaxed">
            I’m an undergraduate pursuing a degree in Computer Science – AI, complemented by specialized coursework in Data Science and Artificial Intelligence. My academic journey gives me a theoretical grounding in cloud computing, machine learning, and software development, while my hands-on projects have challenged me to apply that knowledge in real-world scenarios.
          </p>
          <p class="text-gray-300 leading-relaxed">
            Here you can explore my world, from an none fancy IT Developer to a person that have great passion in seeking knowledge by exploring new technologies and world insight about AI and related domain when applying up-to-date technologies into it.
          </p>

          <div>
            <h3 class="text-2xl font-semibold mb-4">Fields of Interest</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="field in fields" :key="field.title" 
                class="p-6 bg-gradient-jet rounded-lg">
                <h4 class="text-xl font-medium text-orange-yellow">{{ field.title }}</h4>
                <p class="mt-2 text-gray-300">{{ field.description }}</p>
              </div>
            </div>
          </div>
        </section>        
        
        <!-- Resume Section -->
        <section 
          v-if="currentSection === 'Resume'" 
          key="resume" 
          class="space-y-8"
          id="resume-panel"
          role="tabpanel"
          aria-labelledby="resume-tab"
        >
          <h2 class="text-3xl font-semibold">Resume</h2>
          
          <!-- Education -->
          <div class="space-y-6">
            <h3 class="text-2xl font-semibold">Education</h3>
            <div class="space-y-4">
              <div v-for="edu in education" :key="edu.degree" class="p-6 bg-gradient-jet rounded-lg">
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="text-xl font-medium text-orange-yellow">{{ edu.degree }}</h4>
                    <p class="text-gray-300">{{ edu.school }}</p>
                  </div>
                  <span class="text-sm text-gray-400">{{ edu.year }}</span>
                </div>
                <p class="mt-2 text-gray-300">{{ edu.description }}</p>
              </div>
            </div>
          </div>

          <!-- Experience -->
          <div class="space-y-6">
            <h3 class="text-2xl font-semibold">Experience</h3>
            <div class="space-y-4">
              <div v-for="exp in experience" :key="exp.title" class="p-6 bg-gradient-jet rounded-lg">
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="text-xl font-medium text-orange-yellow">{{ exp.title }}</h4>
                    <p class="text-gray-300">{{ exp.company }}</p>
                  </div>
                  <span class="text-sm text-gray-400">{{ exp.period }}</span>
                </div>
                <p class="mt-2 text-gray-300">{{ exp.description }}</p>
              </div>
            </div>
          </div>

          <!-- Skills -->
            <div class="space-y-6">
            <h3 class="text-2xl font-semibold">Skills</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div v-for="skill in skills" :key="skill.name" class="p-4 bg-gradient-jet rounded-lg flex items-center">              <img 
                :src="skill.icon_url" 
                :alt="`${skill.name} icon`" 
                class="w-10 h-10 mr-3"
                loading="lazy"
                width="40"
                height="40"
                @error="handleImageLoadError"
              />
              <div class="flex-1">
                <h4 class="text-lg font-medium text-white">{{ skill.name }}</h4>
              </div>
              </div>
            </div>
            </div>
        </section>

        <!-- Certfication -->
        <section v-if="currentSection === 'Resume'" id="certifications" class="space-y-6">
          <h3 class="text-2xl font-semibold pt-6">Certifications</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="cert in certifications" :key="cert.id" class="p-6 bg-gradient-jet rounded-lg">
              <h3 class="text-xl font-medium text-orange-yellow">{{ cert.name }}</h3>
              <p class="text-gray-300">{{ cert.issuer }}</p>
              <p class="text-gray-400">{{ cert.date }}</p>
              <div class="flex gap-3 mt-4">
                <a 
                  v-if="cert.link"
                  :href="cert.link" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="px-4 py-2 bg-jet border border-orange-yellow text-orange-yellow rounded-lg hover:bg-orange-yellow hover:text-white transition-colors"
                >
                  View Certificate
                </a>
                <a 
                  v-if="cert.badge_url"
                  :href="cert.badge_url" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="px-4 py-2 bg-jet border border-orange-yellow text-orange-yellow rounded-lg hover:bg-orange-yellow hover:text-white transition-colors"
                >
                  View Badge
                </a>
              </div>
            </div>
          </div>
        </section>        
        
        <!-- Portfolio Section -->
        <section 
          v-if="currentSection === 'Portfolio'" 
          key="portfolio" 
          class="space-y-12"
          id="portfolio-panel"
          role="tabpanel"
          aria-labelledby="portfolio-tab"
        >
          <h2 class="text-3xl font-semibold">Portfolio</h2>

          <!-- ================================================ -->
          <!-- Academic Research -->
          <!-- ================================================ -->
          <div class="space-y-4">
            <h3 class="text-2xl font-semibold text-aws-lime border-b border-gray-700 pb-2">
            Academic Research
            </h3>

            <!-- Multi-select filter -->
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="cat in researchCategories"
                :key="cat"
                @click="toggleResearchFilter(cat)"
                class="px-3 py-1.5 text-sm rounded-lg transition-colors"
                :class="selectedResearchFilters.has(cat) ? 'bg-aws-lime text-white font-medium' : 'bg-jet text-gray-400 hover:text-white'"
              >
                {{ cat }}
              </button>
              <button
                v-if="selectedResearchFilters.size > 0"
                @click="selectedResearchFilters.clear()"
                class="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                ✕ Clear
              </button>
            </div>

            <!-- Cards -->
            <div v-if="filteredResearch.length === 0" class="text-gray-500 text-sm py-4">
              No papers match the selected filters.
            </div>
            <div class="space-y-6">
              <div
                v-for="project in filteredResearch"
                :key="project.title"
                class="flex flex-col md:flex-row bg-gradient-jet rounded-xl overflow-hidden"
              >
                <div class="md:w-2/5 lg:w-1/3 shrink-0">
                  <img 
                    :src="getProjectImage(project.image_url)"
                    :alt="project.title"
                    class="w-full aspect-[4/3] md:h-full object-cover"
                    loading="lazy"
                    @error="handleImageLoadError"
                  />
                </div>
                <div class="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <h4 class="text-lg font-semibold text-white mb-2">{{ project.title }}</h4>
                    <p class="text-gray-300 text-sm leading-relaxed">{{ project.description }}</p>
                    <div class="flex flex-wrap gap-2 mt-3">
                      <span
                        v-for="cat in project.categories?.filter(c => c !== 'Research Paper')"
                        :key="cat"
                        class="px-2 py-0.5 text-xs bg-aws-lime/20 text-aws-lime rounded"
                      >
                        {{ cat }}
                      </span>
                    </div>
                  </div>
                  <a 
                    :href="project.github_url"
                    target="_blank"
                    rel="noopener noreferrer" 
                    class="inline-block mt-4 px-4 py-2 bg-aws-lime text-white text-sm font-medium rounded-lg hover:brightness-110 transition-colors self-start"
                  >
                    View Paper →
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          
          <!-- ================================================ -->
          <!-- Industry Projects -->
          <!-- ================================================ -->
          <div class="space-y-2">
            <h3 class="text-2xl font-semibold text-aws-orange border-b border-gray-700 pb-2">
              Industry Projects
            </h3>

            <!-- Multi-select filter -->
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="cat in industryCategories"
                :key="cat"
                @click="toggleIndustryFilter(cat)"
                class="px-3 py-1.5 text-sm rounded-lg transition-colors"
                :class="selectedIndustryFilters.has(cat) ? 'bg-orange-yellow text-white' : 'bg-jet text-gray-400 hover:text-white'"
              >
                {{ cat }}
              </button>
              <button
                v-if="selectedIndustryFilters.size > 0"
                @click="selectedIndustryFilters.clear()"
                class="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                ✕ Clear
              </button>
            </div>

            <!-- Cards -->
            <div v-if="filteredIndustry.length === 0" class="text-gray-500 text-sm py-4">
              No projects match the selected filters.
            </div>
            <div class="space-y-6">
              <div
                v-for="project in filteredIndustry"
                :key="project.title"
                class="flex flex-col md:flex-row bg-gradient-jet rounded-xl overflow-hidden"
              >
                <div class="md:w-2/5 lg:w-1/3 shrink-0">
                  <img 
                    :src="getProjectImage(project.image_url)"
                    :alt="project.title"
                    class="w-full aspect-[4/3] md:h-full object-cover"
                    loading="lazy"
                    @error="handleImageLoadError"
                  />
                </div>
                <div class="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <h4 class="text-lg font-semibold text-white mb-2">{{ project.title }}</h4>
                    <p class="text-gray-300 text-sm leading-relaxed">{{ project.description }}</p>
                    <div class="flex flex-wrap gap-2 mt-3">
                      <span
                        v-for="cat in project.categories?.filter(c => c !== 'Research Paper')"
                        :key="cat"
                        class="px-2 py-0.5 text-xs bg-aws-orange/20 text-aws-orange rounded"
                      >
                        {{ cat }}
                      </span>
                    </div>
                  </div>
                  <a 
                    :href="project.github_url"
                    target="_blank"
                    rel="noopener noreferrer" 
                    class="inline-block mt-4 px-4 py-2 bg-orange-yellow text-white text-sm rounded-lg hover:bg-orange-600 transition-colors self-start"
                  >
                    GitHub →
                  </a>
                </div>
              </div>
            </div>
          </div>

        
        </section>        

        <!-- Contact Section -->
        <section 
          v-if="currentSection === 'Contact'" 
          key="contact" 
          class="space-y-8"
          id="contact-panel"
          role="tabpanel"
          aria-labelledby="contact-tab"
        >
          <h2 class="text-3xl font-semibold">Contact</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Contact Form -->
            <form @submit.prevent="handleSubmit" class="space-y-4" novalidate>
              <div>
                <label for="name" class="block text-sm font-medium text-gray-300 mb-1">
                  Name <span class="text-red-400">*</span>
                </label>
                <input
                  id="name"
                  v-model="contactForm.name"
                  type="text"
                  required
                  :class="[
                    'w-full px-4 py-2 bg-jet rounded-lg text-white focus:outline-none focus:ring-2 transition-colors',
                    formErrors.name ? 'border-red-500 focus:ring-red-400' : 'focus:ring-orange-yellow'
                  ]"
                  :aria-invalid="!!formErrors.name"
                  :aria-describedby="formErrors.name ? 'name-error' : undefined"
                />
                <p v-if="formErrors.name" id="name-error" class="mt-1 text-sm text-red-400">
                  {{ formErrors.name }}
                </p>
              </div>
              
              <div>
                <label for="email" class="block text-sm font-medium text-gray-300 mb-1">
                  Email <span class="text-red-400">*</span>
                </label>
                <input
                  id="email"
                  v-model="contactForm.email"
                  type="email"
                  required
                  :class="[
                    'w-full px-4 py-2 bg-jet rounded-lg text-white focus:outline-none focus:ring-2 transition-colors',
                    formErrors.email ? 'border-red-500 focus:ring-red-400' : 'focus:ring-orange-yellow'
                  ]"
                  :aria-invalid="!!formErrors.email"
                  :aria-describedby="formErrors.email ? 'email-error' : undefined"
                />
                <p v-if="formErrors.email" id="email-error" class="mt-1 text-sm text-red-400">
                  {{ formErrors.email }}
                </p>
              </div>
              
              <div>
                <label for="message" class="block text-sm font-medium text-gray-300 mb-1">
                  Message <span class="text-red-400">*</span>
                </label>
                <textarea
                  id="message"
                  v-model="contactForm.message"
                  required
                  rows="4"
                  :class="[
                    'w-full px-4 py-2 bg-jet rounded-lg text-white focus:outline-none focus:ring-2 transition-colors',
                    formErrors.message ? 'border-red-500 focus:ring-red-400' : 'focus:ring-orange-yellow'
                  ]"
                  :aria-invalid="!!formErrors.message"
                  :aria-describedby="formErrors.message ? 'message-error' : undefined"
                ></textarea>
                <p v-if="formErrors.message" id="message-error" class="mt-1 text-sm text-red-400">
                  {{ formErrors.message }}
                </p>
              </div>
              
              <button
                type="submit"
                class="w-full px-6 py-3 bg-orange-yellow text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isSubmitting"
                :aria-describedby="submitStatus ? 'form-status' : undefined"
              >
                <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </span>
                <span v-else>Send Message</span>
              </button>
              
              <!-- Form Notifications with better styling -->
              <div v-if="submitStatus" id="form-status" class="mt-4" role="alert" aria-live="polite">
                <div v-if="submitStatus === 'success'" 
                    class="p-4 bg-green-600/20 border border-green-600 rounded-lg text-green-400">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <p>Message sent successfully! I will get back to you as soon as possible.</p>
                  </div>
                </div>
                <div v-if="submitStatus === 'error'" 
                    class="p-4 bg-red-600/20 border border-red-600 rounded-lg text-red-400">
                  <div class="flex items-start gap-2">
                    <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                    <div>
                      <p class="font-medium">Failed to send message</p>
                      <p class="text-sm mt-1">{{ errorMessage || 'Please try again or contact me directly at your-email@example.com' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <!-- Map -->
            <div class="h-96 bg-jet rounded-lg overflow-hidden">
              <iframe
                :src="profile?.map_embed ?? 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62708.14387673113!2d106.58612376222044!3d10.79146507555257!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752bf733e69175%3A0xd8d63453733325fe!2sT%C3%A2n%20Ph%C3%BA%2C%20Ho%20Chi%20Minh%20City%2C%20Vietnam!5e0!3m2!1sen!2s!4v1741602034108!5m2!1sen!2s'"
                width="100%"
                height="100%"
                style="border:0;"
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </section>
      </TransitionGroup>
    </main>    
    
    <!-- Mobile Menu Button -->
    <button 
      @click="toggleSidebar"
      class="fixed bottom-4 right-4 md:hidden bg-orange-yellow p-2 rounded-full shadow-lg hover:bg-orange-600 transition-colors z-30"
      aria-label="Toggle navigation menu"
      :aria-expanded="isSidebarOpen"
    >
      <IconMenu class="w-6 h-6" />
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ContactForm, Section, FormSubmissionResponse, Profile, SocialLink, Project, Skill, Education, Experience, Certification, Field } from '~/types/portfolio'

// Fetch all portfolio data from Supabase in parallel
const {
  fetchProfile, fetchSocialLinks, fetchFields, fetchEducation,
  fetchExperience, fetchSkills, fetchCertifications, fetchProjects,
  getPublicUrl,
} = useSupabaseData()

const { data: portfolio } = await useAsyncData('portfolio-data', async () => {
  const [profileData, socialLinksData, fieldsData, educationData, experienceData, skillsData, certificationsData, projectsData] = await Promise.all([
    fetchProfile(),
    fetchSocialLinks(),
    fetchFields(),
    fetchEducation(),
    fetchExperience(),
    fetchSkills(),
    fetchCertifications(),
    fetchProjects(),
  ])
  return {
    profile: profileData,
    socialLinks: socialLinksData,
    fields: fieldsData,
    education: educationData,
    experience: experienceData,
    skills: skillsData,
    certifications: certificationsData,
    projects: projectsData,
  }
})

// Computed accessors for template use
const profile = computed<Profile | null>(() => portfolio.value?.profile ?? null)
const socialLinks = computed<SocialLink[]>(() => portfolio.value?.socialLinks ?? [])
const fields = computed<Field[]>(() => portfolio.value?.fields ?? [])
const education = computed<Education[]>(() => portfolio.value?.education ?? [])
const experience = computed<Experience[]>(() => portfolio.value?.experience ?? [])
const skills = computed<Skill[]>(() => portfolio.value?.skills ?? [])
const certifications = computed<Certification[]>(() => portfolio.value?.certifications ?? [])
const projects = computed<Project[]>(() => portfolio.value?.projects ?? [])
const client = useSupabaseClient()

const { error, isLoading, handleError, withErrorHandling, clearError } = useErrorHandler()
const { validateForm, sanitizeForm } = useFormValidation()
const { handleImageError, preloadImages } = usePerformance()
const { 
  currentSection, 
  isSidebarOpen, 
  sections, 
  sidebarClasses, 
  mainClasses,
  toggleSidebar 
} = usePortfolio()

// Watch for blog selection on mobile
watch(currentSection, (newValue) => {
  // Use string comparison since currentSection can be any string from the select
  if (newValue === 'blog-link' as any) {
    navigateTo('/blog')
    // Reset to previous section
    currentSection.value = 'About'
  }
})

// Runtime config
const config = useRuntimeConfig()

// SEO Meta tags
useSeoMeta({
  title: () => `${config.public.siteName} - ${currentSection.value}`,
  ogTitle: () => `${config.public.siteName} - ${currentSection.value}`,
  description: config.public.siteDescription,
  ogDescription: config.public.siteDescription,
  ogImage: '/my_image2.jpg',
  twitterCard: 'summary_large_image'
})

// Form state with proper typing
const contactForm = reactive<ContactForm>({
  name: '',
  email: '',
  message: ''
})

const isSubmitting = ref<boolean>(false)
const submitStatus = ref<'success' | 'error' | null>(null)
const errorMessage = ref<string>('')
const formErrors = ref<Record<string, string>>({})

// Enhanced image error handling
const handleImageLoadError = (event: Event) => {
  handleImageError(event, '/images/placeholder.svg')
}

// Enhanced form submission with better error handling
const sendSubmission = async (accessKey: string, recipient: string): Promise<FormSubmissionResponse> => {
  try {
    const sanitizedForm = sanitizeForm(contactForm)
    
    const formData = new FormData()
    formData.append('name', sanitizedForm.name)
    formData.append('email', sanitizedForm.email)
    formData.append('message', sanitizedForm.message)
    formData.append('access_key', accessKey)
    formData.append('recipient', recipient)

    const object = Object.fromEntries(formData.entries())
    const json = JSON.stringify(object)

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: json
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`)
    }

    if (!result.success) {
      throw new Error(result.message || 'Form submission failed')
    }

    return result
  } catch (error) {
    console.error('Form submission error:', error)
    throw error
  }
}

const handleSubmit = async (event: Event) => {
  event.preventDefault()
  
  // Clear previous states
  submitStatus.value = null
  errorMessage.value = ''
  formErrors.value = {}
  
  // Client-side validation
  const validation = validateForm(contactForm)
  if (!validation.isValid) {
    formErrors.value = validation.errors
    return
  }
  
  isSubmitting.value = true
  try {
    // Check configuration
    if (!config.public.web3FormsAccessKey1 || !config.public.contactEmail1) {
      throw new Error('Form configuration is missing. Please contact the site administrator.')
    }

    let successCount = 0
    const errors: string[] = []

    // First submission (primary)
    try {
      const result1 = await sendSubmission(
        config.public.web3FormsAccessKey1, 
        config.public.contactEmail1
      )
      console.log("Form submitted successfully to first recipient:", result1)
      successCount++
    } catch (error1: unknown) {
      console.error('First submission failed:', error1)
      const errorMsg = error1 instanceof Error ? error1.message : String(error1)
      errors.push(`Primary submission failed: ${errorMsg}`)
    }

    // Second submission (backup - if configured)
    if (config.public.web3FormsAccessKey2 && config.public.contactEmail2) {
      try {
        const result2 = await sendSubmission(
          config.public.web3FormsAccessKey2, 
          config.public.contactEmail2
        )
        console.log("Form submitted successfully to second recipient:", result2)
        successCount++
      } catch (error2: unknown) {
        console.error('Second submission failed:', error2)
        const errorMsg = error2 instanceof Error ? error2.message : String(error2)
        errors.push(`Backup submission failed: ${errorMsg}`)
      }
    } else {
      // If no backup configured, we only need primary to succeed
      successCount = successCount > 0 ? 2 : 0
    }

    // Determine overall success
    if (successCount > 0) {
      submitStatus.value = 'success'
            
      // Save to Supabase
      await client.from('contact_messages').insert({
        guest_name: contactForm.name,
        guest_email: contactForm.email,
        message: contactForm.message,
      })

      // Reset form on success
      contactForm.name = ""
      contactForm.email = ""
      contactForm.message = ""
      
      // Log any partial failures
      if (errors.length > 0) {
        console.warn('Some submissions failed but message was delivered:', errors)
      }
    } else {
      // All submissions failed
      throw new Error(errors.join('; ') || 'All form submissions failed')
    }
    
  } catch (error) {
    console.error('Form submission error:', error)
    submitStatus.value = 'error'
    errorMessage.value = error instanceof Error ? error.message : 'Failed to send message. Please try again or contact me directly.'
    
    // Don't clear the form on error so user can retry
  } finally {
    isSubmitting.value = false
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      submitStatus.value = null
      errorMessage.value = ''
    }, 5000)
  }
}

// Helper: resolve Supabase storage URL from relative path
const getProjectImage = (imageUrl: string | null): string => {
  if (!imageUrl) return ''
  // If it's already a full URL, return as-is
  if (imageUrl.startsWith('http')) return imageUrl
  return getPublicUrl('projects', imageUrl)
}

const getAvatarImage = (avatarUrl: string | null): string => {
  if (!avatarUrl) return '/my_image2.jpg'
  if (avatarUrl.startsWith('http')) return avatarUrl
  return getPublicUrl('avatars', avatarUrl)
}

// ── Multi-select filters ───────────────────────────
const selectedIndustryFilters = ref(new Set<string>())
const selectedResearchFilters = ref(new Set<string>())

const toggleIndustryFilter = (cat: string) => {
  if (selectedIndustryFilters.value.has(cat)) {
    selectedIndustryFilters.value.delete(cat)
  } else {
    selectedIndustryFilters.value.add(cat)
  }
  // Trigger reactivity
  selectedIndustryFilters.value = new Set(selectedIndustryFilters.value)
}

const toggleResearchFilter = (cat: string) => {
  if (selectedResearchFilters.value.has(cat)) {
    selectedResearchFilters.value.delete(cat)
  } else {
    selectedResearchFilters.value.add(cat)
  }
  selectedResearchFilters.value = new Set(selectedResearchFilters.value)
}

// ── Base project pools ─────────────────────────────
const industryPool = computed(() =>
  projects.value.filter(p => !(p.categories ?? []).includes('Research Paper'))
)

const researchPool = computed(() =>
  projects.value.filter(p => (p.categories ?? []).includes('Research Paper'))
)

// ── Unique categories per section (exclude section tag) ──
const industryCategories = computed<string[]>(() => {
  const cats = industryPool.value.flatMap(p => p.categories ?? [])
  return [...new Set(cats.filter(c => c !== 'Research Paper'))]
})

const researchCategories = computed<string[]>(() => {
  const cats = researchPool.value.flatMap(p => p.categories ?? [])
  return [...new Set(cats.filter(c => c !== 'Research Paper'))]
})

// ── Filtered results (multi-select, OR logic) ─────
const filteredIndustry = computed(() => {
  const filters = selectedIndustryFilters.value
  if (filters.size === 0) return industryPool.value
  return industryPool.value.filter(p =>
    (p.categories ?? []).some(c => filters.has(c))
  )
})

const filteredResearch = computed(() => {
  const filters = selectedResearchFilters.value
  if (filters.size === 0) return researchPool.value
  return researchPool.value.filter(p =>
    (p.categories ?? []).some(c => filters.has(c))
  )
})

// Preload critical images on mount
onMounted(async () => {
  const criticalImages = [
    getAvatarImage(profile.value?.avatar_url ?? null),
    ...projects.value.slice(0, 3).map(p => getProjectImage(p.image_url)).filter(Boolean) as string[]
  ]
  await preloadImages(criticalImages)
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>