// Email through SES (production access). Sender = SES_FROM_EMAIL (contact@<domain>); bounce and
// complaint feedback is forwarded to CONTACT_TO_EMAIL (the owner's mailbox, a verified identity).
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'

const FROM_NAME = 'Le Hoang Triet Thong'
let ses: SESv2Client | undefined

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/** Strip CR/LF so user text can never inject extra headers via the subject line. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').slice(0, 150)

const paragraphs = (text: string) =>
  text.split(/\n{2,}/).map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('')

function config() {
  const cfg = useRuntimeConfig()
  if (!cfg.sesFromEmail || !cfg.contactToEmail) throw new Error('SES_FROM_EMAIL / CONTACT_TO_EMAIL not configured')
  ses ??= new SESv2Client({ region: cfg.appRegion })
  return cfg
}

async function send(opts: { to: string, replyTo?: string, subject: string, text: string, html: string }) {
  const cfg = config()
  await ses!.send(new SendEmailCommand({
    FromEmailAddress: `${FROM_NAME} <${cfg.sesFromEmail}>`,
    Destination: { ToAddresses: [opts.to] },
    ReplyToAddresses: opts.replyTo ? [opts.replyTo] : undefined,
    FeedbackForwardingEmailAddress: cfg.contactToEmail,
    Content: {
      Simple: {
        Subject: { Data: oneLine(opts.subject), Charset: 'UTF-8' },
        Body: { Text: { Data: opts.text, Charset: 'UTF-8' }, Html: { Data: opts.html, Charset: 'UTF-8' } },
      },
    },
  }))
}

/** Notification to the owner (contact form). Reply-To = the visitor. */
export async function notifyOwner(opts: { subject: string, replyTo?: string, fields: [label: string, value: string][] }) {
  const cfg = config()
  await send({
    to: cfg.contactToEmail,
    replyTo: opts.replyTo,
    subject: opts.subject,
    text: opts.fields.map(([k, v]) => `${k}:\n${v}`).join('\n\n'),
    html: opts.fields.map(([k, v]) => `<p><strong>${escapeHtml(k)}</strong><br>${escapeHtml(v).replace(/\n/g, '<br>')}</p>`).join(''),
  })
}

/** One-to-one reply to a visitor who contacted the owner first. Reply-To = the owner's mailbox. */
export async function sendReply(opts: { to: string, subject: string, message: string }) {
  const cfg = config()
  const site = new URL(String(cfg.public.siteUrl || 'https://chilonthon.com')).host
  const footer = `You are receiving this because you contacted me via ${site}. ` +
    'If this was not you, please ignore this email — you will not hear from me again.'
  await send({
    to: opts.to,
    replyTo: cfg.contactToEmail,
    subject: opts.subject,
    text: `${opts.message}\n\n--\n${footer}`,
    html: `${paragraphs(opts.message)}<hr><p style="color:#666;font-size:12px">${escapeHtml(footer)}</p>`,
  })
}
