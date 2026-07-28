export type EmailAddress = {
  email: string
  name?: string
}

export type EmailMessage = {
  to: EmailAddress
  subject: string
  text: string
  html: string
}

export type EmailSendResult = { ok: true } | { ok: false; errorCode: string }

export interface EmailProvider {
  send(message: EmailMessage): Promise<EmailSendResult>
}
