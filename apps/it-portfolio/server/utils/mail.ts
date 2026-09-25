// Owner notifications through SES (sandbox: sender and recipient are the verified owner address).
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'

let ses: SESv2Client | undefined

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/** Strip CR/LF so user text can never inject extra headers via the subject line. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').slice(0, 150)

export async function notifyOwner(opts: { subject: string, replyTo?: string, fields: [label: string, value: string][] }) {
  const cfg = useRuntimeConfig()
  if (!cfg.sesFromEmail || !cfg.contactToEmail) throw new Error('SES_FROM_EMAIL / CONTACT_TO_EMAIL not configured')
  ses ??= new SESv2Client({ region: cfg.appRegion })

  const text = opts.fields.map(([k, v]) => `${k}:\n${v}`).join('\n\n')
  const html = opts.fields
    .map(([k, v]) => `<p><strong>${escapeHtml(k)}</strong><br>${escapeHtml(v).replace(/\n/g, '<br>')}</p>`)
    .join('')

  await ses.send(new SendEmailCommand({
    FromEmailAddress: cfg.sesFromEmail,
    Destination: { ToAddresses: [cfg.contactToEmail] },
    ReplyToAddresses: opts.replyTo ? [opts.replyTo] : undefined,
    Content: {
      Simple: {
        Subject: { Data: oneLine(opts.subject), Charset: 'UTF-8' },
        Body: { Text: { Data: text, Charset: 'UTF-8' }, Html: { Data: html, Charset: 'UTF-8' } },
      },
    },
  }))
}
