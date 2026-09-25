import { Resend } from 'resend'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { to, guestName, subject, message } = body

  const config = useRuntimeConfig()
  const resend = new Resend(config.resendApiKey)

  const { data, error } = await resend.emails.send({
    from: 'Le Hoang Triet Thong <onboarding@resend.dev>',
    
    // 1. Uncommented and hardcoded to your ONE verified Resend account email
    to: 'lhtthong.forwork@outlook.com', 
  
    // 2. Pointing to the variable that holds the guest's email address
    reply_to: to,
    subject: `New Portfolio Message from ${guestName}`,
    html: `
      <h3>New Message via Portfolio Contact Form</h3>
      <p><strong>From:</strong> ${guestName} (${to})</p>
      <br/>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `,
  })

  if (error) throw createError({ statusCode: 500, message: error.message })
  return { success: true, data }
})
