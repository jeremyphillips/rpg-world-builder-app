import nodemailer from 'nodemailer'

import type { EmailMessage, EmailProvider, EmailSendResult } from '../email.types'

export type EtherealEmailProviderConfig = {
  fromAddress: string
}

export function createEtherealEmailProvider(config: EtherealEmailProviderConfig): EmailProvider {
  return {
    async send(message: EmailMessage): Promise<EmailSendResult> {
      try {
        const account = await nodemailer.createTestAccount()
        const transport = nodemailer.createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: {
            user: account.user,
            pass: account.pass,
          },
        })

        const info = await transport.sendMail({
          from: config.fromAddress,
          to: formatAddress(message.to),
          subject: message.subject,
          text: message.text,
          html: message.html,
        })

        const previewUrl = nodemailer.getTestMessageUrl(info)
        if (previewUrl) {
          console.info(`[email] Ethereal preview: ${previewUrl}`)
        }

        return { ok: true }
      } catch {
        return { ok: false, errorCode: 'ethereal_send_failed' }
      }
    },
  }
}

function formatAddress(address: EmailMessage['to']): string {
  return address.name ? `${address.name} <${address.email}>` : address.email
}
