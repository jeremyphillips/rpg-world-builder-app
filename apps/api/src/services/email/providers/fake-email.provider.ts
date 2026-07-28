import type { EmailMessage, EmailProvider, EmailSendResult } from '../email.types'

export type SentEmailRecord = EmailMessage & { sentAt: string }

const sentMessages: SentEmailRecord[] = []

export function createFakeEmailProvider(): EmailProvider {
  return {
    async send(message: EmailMessage): Promise<EmailSendResult> {
      sentMessages.push({ ...message, sentAt: new Date().toISOString() })
      return { ok: true }
    },
  }
}

export function getFakeEmailSentMessages(): readonly SentEmailRecord[] {
  return sentMessages
}

export function resetFakeEmailSentMessages(): void {
  sentMessages.length = 0
}

export function setFakeEmailSendResult(result: EmailSendResult): EmailProvider {
  return {
    async send(message: EmailMessage): Promise<EmailSendResult> {
      if (result.ok) {
        sentMessages.push({ ...message, sentAt: new Date().toISOString() })
      }
      return result
    },
  }
}
