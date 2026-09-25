// Admin: email a reply draft to the OWNER with Reply-To = guest. SES is in sandbox (only the
// verified owner address can receive), so the owner answers the guest from their own mailbox —
// the same workaround the old Resend setup used.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const b = await readObject(event)
  const to = str(b.to, 'to', { required: true, max: 254, pattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/ })!
  const guestName = str(b.guestName, 'guestName', { required: true, max: 120 })!
  const subject = str(b.subject, 'subject', { required: true, max: 200 })!
  const message = str(b.message, 'message', { required: true, max: 10000 })!

  await notifyOwner({
    subject: `${subject} (reply to ${guestName})`,
    replyTo: to,
    fields: [
      ['Guest', `${guestName} <${to}>`],
      ['Your reply — press Reply in your mail app to send it to the guest', message],
    ],
  })
  return { success: true }
})
