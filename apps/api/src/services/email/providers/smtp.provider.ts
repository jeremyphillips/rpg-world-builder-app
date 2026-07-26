import nodemailer from 'nodemailer'

import type { EmailMessage, EmailProvider, EmailSendResult } from '../email.types'

export type SmtpEmailProviderConfig = {
  host: string
  port: number
  user: string
  pass: string
  fromAddress: string
}

export function createSmtpEmailProvider(config: SmtpEmailProviderConfig): EmailProvider {
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  })

  return {
    async send(message: EmailMessage): Promise<EmailSendResult> {
      try {
        await transport.sendMail({
          from: config.fromAddress,
          to: formatAddress(message.to),
          subject: message.subject,
          text: message.text,
          html: message.html,
        })
        return { ok: true }
      } catch {
        return { ok: false, errorCode: 'smtp_send_failed' }
      }
    },
  }
}

function formatAddress(address: EmailMessage['to']): string {
  return address.name ? `${address.name} <${address.email}>` : address.email
}
