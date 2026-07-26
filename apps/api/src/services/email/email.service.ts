import { APP_NAME } from '@rpg/contracts'

import { loadEnv } from '../../env'
import type { EmailProvider, EmailSendResult } from './email.types'
import { createEtherealEmailProvider } from './providers/ethereal.provider'
import {
  createFakeEmailProvider,
  resetFakeEmailSentMessages,
} from './providers/fake-email.provider'
import { createSmtpEmailProvider } from './providers/smtp.provider'
import {
  buildCampaignInviteEmailHtml,
  buildCampaignInviteEmailSubject,
  buildCampaignInviteEmailText,
  type CampaignInviteEmailTemplateInput,
} from './templates/campaign-invite.template'

export type CampaignInviteEmailInput = Omit<CampaignInviteEmailTemplateInput, 'inviteUrl'> & {
  inviteId: string
  recipientEmail: string
  rawToken: string
}

let providerOverride: EmailProvider | undefined

export function setEmailProviderForTests(provider: EmailProvider | undefined): void {
  providerOverride = provider
  resetFakeEmailSentMessages()
}

export function getEmailProvider(): EmailProvider {
  if (providerOverride) return providerOverride

  const env = loadEnv()
  switch (env.emailProvider) {
    case 'fake':
      return createFakeEmailProvider()
    case 'ethereal':
      return createEtherealEmailProvider({ fromAddress: env.smtpFromAddress })
    case 'smtp':
      return createSmtpEmailProvider({
        host: env.smtpHost,
        port: env.smtpPort,
        user: env.smtpUser,
        pass: env.smtpPass,
        fromAddress: env.smtpFromAddress,
      })
  }
}

export function buildCampaignInviteUrl(rawToken: string): string {
  const { appBaseUrl } = loadEnv()
  return `${appBaseUrl}/campaign-invites/${rawToken}`
}

export async function sendCampaignInviteEmail(
  input: CampaignInviteEmailInput,
  provider: EmailProvider = getEmailProvider(),
): Promise<EmailSendResult> {
  const inviteUrl = buildCampaignInviteUrl(input.rawToken)
  const templateInput: CampaignInviteEmailTemplateInput = {
    campaignName: input.campaignName,
    inviterName: input.inviterName,
    inviteUrl,
    appName: APP_NAME,
  }

  const message = {
    to: { email: input.recipientEmail },
    subject: buildCampaignInviteEmailSubject(templateInput),
    text: buildCampaignInviteEmailText(templateInput),
    html: buildCampaignInviteEmailHtml(templateInput),
  }

  const result = await provider.send(message)
  if (!result.ok) {
    console.error('[email] campaign invite delivery failed', {
      inviteId: input.inviteId,
      recipient: maskEmail(input.recipientEmail),
      errorCode: result.errorCode,
    })
  }
  return result
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return '***'
  const visible = local.slice(0, Math.min(1, local.length))
  return `${visible}***@${domain}`
}

export {
  buildCampaignInviteEmailHtml,
  buildCampaignInviteEmailSubject,
  buildCampaignInviteEmailText,
} from './templates/campaign-invite.template'
