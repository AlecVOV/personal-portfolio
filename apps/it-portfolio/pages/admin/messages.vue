<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Messages</h1>

    <div v-if="loading" class="text-gray-400">Loading messages...</div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="text-xs text-gray-400 uppercase border-b border-gray-700">
          <tr>
            <th class="px-4 py-3">From</th>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3">Message</th>
            <th class="px-4 py-3">Date</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr v-for="msg in messages" :key="msg.id" class="hover:bg-jet/50">
            <td class="px-4 py-3 font-medium">{{ msg.guest_name }}</td>
            <td class="px-4 py-3 text-gray-300">{{ msg.guest_email }}</td>
            <td class="px-4 py-3 text-gray-400 max-w-xs truncate">{{ msg.message }}</td>
            <td class="px-4 py-3 text-gray-500 text-sm">
              {{ new Date(msg.created_at).toLocaleDateString() }}
            </td>
            <td class="px-4 py-3">
              <span :class="msg.replied ? 'text-green-400' : 'text-yellow-400'" class="text-sm">
                {{ msg.replied ? 'Replied' : 'Pending' }}
              </span>
            </td>
            <td class="px-4 py-3 space-x-2">
              <button @click="openMessage(msg)" class="text-blue-400 hover:text-blue-300">View</button>
              <button v-if="!msg.replied" @click="openReply(msg)" class="text-green-400 hover:text-green-300">Reply</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- View Message Modal -->
    <Teleport to="body">
      <div v-if="viewingMessage" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" @click.self="viewingMessage = null">
        <div class="bg-gradient-jet rounded-2xl p-6 w-full max-w-lg">
          <h3 class="text-lg font-semibold mb-3">{{ viewingMessage.guest_name }}</h3>
          <p class="text-gray-400 text-sm mb-1">{{ viewingMessage.guest_email }}</p>
          <p class="text-gray-300 whitespace-pre-wrap">{{ viewingMessage.message }}</p>
          <button @click="viewingMessage = null" class="mt-4 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">Close</button>
        </div>
      </div>
    </Teleport>

    <!-- Reply Modal -->
    <Teleport to="body">
      <div v-if="replyTarget" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" @click.self="replyTarget = null">
        <div class="bg-gradient-jet rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-semibold mb-4">Reply to {{ replyTarget.guest_name }}</h3>

          <form @submit.prevent="sendReply" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-300 mb-1">Sender</label>
              <p class="text-white">{{ senderEmail }}</p>
              <label class="block text-sm text-gray-300 mb-1 pt-2">CC:</label>
              <p class="text-white">{{ ccList }}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Subject</label>
              <input v-model="replySubject" class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Message</label>
              <textarea v-model="replyBody" rows="6" class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
            </div>
            <div class="flex justify-end gap-3">
              <button type="button" @click="replyTarget = null" class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
              <button type="submit" :disabled="sending" class="px-4 py-2 bg-orange-yellow rounded-lg hover:bg-orange-600 disabled:opacity-50">
                {{ sending ? 'Sending...' : 'Send Reply' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin-auth'], layout: 'admin' })

const client = useSupabaseClient()
const messages = ref<any[]>([])
const loading = ref(true)
const viewingMessage = ref<any>(null)
const replyTarget = ref<any>(null)
const sending = ref(false)

const senderEmail = 'lhtthong.forwork@outlook.com'
const ccList = [
  'lhtthong.forwork@gmail.com',
  'lehoangtrietthong@gmail.com',
  'lehoangtrietthong2102004@gmail.com',
].join(', ')
const replySubject = ref('')
const replyBody = ref('')

const load = async () => {
  loading.value = true
  const { data, error } = await client.from('contact_messages').select('*').order('created_at', { ascending: false })
  if (!error && data) messages.value = data
  loading.value = false
}

await load()

const openMessage = (msg: any) => { viewingMessage.value = msg }
const openReply = (msg: any) => {
  replyTarget.value = msg
  replySubject.value = `Re: Your message to Alec Le`
  replyBody.value = `Hi ${msg.guest_name},\n\nThank you for reaching out!\n\n`
}

const sendReply = async () => {
  sending.value = true
  try {
    await $fetch('/api/messages/send-reply', {
      method: 'POST',
      body: {
        to: replyTarget.value.guest_email,
        guestName: replyTarget.value.guest_name,
        subject: replySubject.value,
        message: replyBody.value,
      },
    })

    await client.from('contact_messages').update({ replied: true }).eq('id', replyTarget.value.id)
    replyTarget.value = null
    await load()
  } catch (err) {
    console.error(err)
    alert('Failed to send reply.')
  } finally {
    sending.value = false
  }
}
</script>