<template>
  <form @submit.prevent="submitForm" class="space-y-6">
    <div>
      <label for="name" class="block text-sm font-medium mb-2">Name</label>
      <input 
        id="name" 
        v-model="form.name"
        type="text" 
        required
        class="w-full px-4 py-2 border border-primary-300 dark:border-primary-600 rounded-sm bg-white dark:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-accent-500"
      />
    </div>
    
    <div>
      <label for="email" class="block text-sm font-medium mb-2">Email</label>
      <input 
        id="email" 
        v-model="form.email"
        type="email" 
        required
        class="w-full px-4 py-2 border border-primary-300 dark:border-primary-600 rounded-sm bg-white dark:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-accent-500"
      />
    </div>
    
        
    <div>
      <label for="message" class="block text-sm font-medium mb-2">Message</label>
      <textarea 
        id="message" 
        v-model="form.message"
        rows="5" 
        required
        class="w-full px-4 py-2 border border-primary-300 dark:border-primary-600 rounded-sm bg-white dark:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-accent-500"
      ></textarea>
    </div>

  <!-- Honeypot field (hidden) to reduce spam bots) -->
  <input type="checkbox" v-model="form.botcheck" class="hidden" tabindex="-1" autocomplete="off" aria-hidden="true" />
    
    <div>
      <button 
        type="submit" 
        class="btn btn-primary w-full"
        :disabled="isSubmitting"
        :class="{ 'opacity-50 cursor-not-allowed hover:scale-100': isSubmitting }"
      >
        <span v-if="isSubmitting">Sending...</span>
        <span v-else>Send Message</span>
      </button>
    </div>
    
    <div v-if="formSubmitted" class="text-center p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-sm">
      Thank you for your message! I'll get back to you soon.
    </div>
    <div v-if="submissionError" class="text-center p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-sm">
      {{ submissionError }}
    </div>
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue';
const {
  public: { web3formsKey1, web3formsKey2 }
} = useRuntimeConfig();

const form = reactive({
  name: '',
  email: '',
  service: '',
  message: '',
  botcheck: '' // honeypot to reduce spam
});

const isSubmitting = ref(false);
const formSubmitted = ref(false);
const submissionError = ref('');

const submitForm = async () => {
  submissionError.value = '';
  formSubmitted.value = false;
  isSubmitting.value = true;

  try {
    if (!web3formsKey1 && !web3formsKey2) {
      throw new Error('Missing Web3Forms keys. Please set NUXT_PUBLIC_WEB3FORMS_KEY1 and/or NUXT_PUBLIC_WEB3FORMS_KEY2.');
    }

    // Basic front-end validation
    if (!form.name || !form.email || !form.message) {
      throw new Error('Please fill in your name, email, and message.');
    }

    // Build payload
    const basePayload = {
      name: form.name,
      email: form.email,
      message: form.message,
      subject: `New Inquiry${form.service ? ' - ' + form.service : ''} (LensCraft)`
    };

  const requests = [];
    const endpoint = 'https://api.web3forms.com/submit';

    if (web3formsKey1) {
      requests.push(
        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({ access_key: web3formsKey1, ...basePayload })
        })
      );
    }
    if (web3formsKey2) {
      requests.push(
        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({ access_key: web3formsKey2, ...basePayload })
        })
      );
    }

    const responses = await Promise.allSettled(requests);
    const jsons = await Promise.all(
      responses.map(async (r) => (r.status === 'fulfilled' ? r.value.json().catch(() => ({})) : {}))
    );

  const anySuccess = jsons.some((j) => j && j.success);
    if (!anySuccess) {
      throw new Error('Failed to send your message. Please try again later.');
    }

    // Reset form on success
    form.name = '';
    form.email = '';
    form.service = '';
    form.message = '';
    form.botcheck = '';

    formSubmitted.value = true;

    // Hide success message after 5 seconds
    setTimeout(() => {
      formSubmitted.value = false;
    }, 5000);
  } catch (err) {
    submissionError.value = (err && err.message) ? err.message : 'Something went wrong. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>