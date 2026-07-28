import { APP_NAME, CAMPAIGN_INVITE_EXPIRY_DAYS } from '@rpg/contracts'

export type CampaignInviteEmailTemplateInput = {
  campaignName: string
  inviterName: string
  inviteUrl: string
  appName?: string
  expiryDays?: number
}

const DEFAULT_INVITER_NAME = 'A campaign owner'

export function buildCampaignInviteEmailSubject(input: CampaignInviteEmailTemplateInput): string {
  const appName = input.appName ?? APP_NAME
  return `You're invited to join ${input.campaignName} on ${appName}`
}

export function buildCampaignInviteEmailText(input: CampaignInviteEmailTemplateInput): string {
  const appName = input.appName ?? APP_NAME
  const inviterName = input.inviterName.trim() || DEFAULT_INVITER_NAME
  const expiryDays = input.expiryDays ?? CAMPAIGN_INVITE_EXPIRY_DAYS

  return [
    `You've been invited to join ${input.campaignName}`,
    '',
    `${inviterName} invited you to join their campaign on ${appName}.`,
    '',
    "After accepting, you can submit an eligible existing character or create a new character using the campaign's rules and available content.",
    '',
    'Accept invitation:',
    input.inviteUrl,
    '',
    `This invitation expires in ${expiryDays} days. You can return to this link any time before it expires to finish setting up your campaign character.`,
    '',
    'If you were not expecting this invitation, you can ignore this email.',
  ].join('\n')
}

export function buildCampaignInviteEmailHtml(input: CampaignInviteEmailTemplateInput): string {
  const appName = input.appName ?? APP_NAME
  const inviterName = input.inviterName.trim() || DEFAULT_INVITER_NAME
  const expiryDays = input.expiryDays ?? CAMPAIGN_INVITE_EXPIRY_DAYS
  const text = buildCampaignInviteEmailText({
    ...input,
    appName,
    inviterName,
    expiryDays,
  })

  return `<!DOCTYPE html>
<html lang="en">
  <body>
    <pre style="font-family: sans-serif; white-space: pre-wrap;">${escapeHtml(text)}</pre>
    <p><a href="${escapeHtml(input.inviteUrl)}">Accept invitation</a></p>
  </body>
</html>`
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
