import { describe, expect, it } from 'vitest'

import { APP_NAME, CAMPAIGN_INVITE_EXPIRY_DAYS } from '@rpg/contracts'

import {
  buildCampaignInviteEmailHtml,
  buildCampaignInviteEmailSubject,
  buildCampaignInviteEmailText,
} from './campaign-invite.template'

describe('campaign invite email template', () => {
  const input = {
    campaignName: 'The Argent Road',
    inviterName: 'Ari',
    inviteUrl: 'http://localhost:8080/campaign-invites/token',
  }

  it('builds the subject with campaign and app name', () => {
    expect(buildCampaignInviteEmailSubject(input)).toBe(
      `You're invited to join The Argent Road on ${APP_NAME}`,
    )
  })

  it('includes invite URL and expiry days in plain text', () => {
    const text = buildCampaignInviteEmailText(input)
    expect(text).toContain('The Argent Road')
    expect(text).toContain('Ari')
    expect(text).toContain(APP_NAME)
    expect(text).toContain(input.inviteUrl)
    expect(text).toContain(`This invitation expires in ${CAMPAIGN_INVITE_EXPIRY_DAYS} days.`)
  })

  it('falls back to a generic inviter name', () => {
    const text = buildCampaignInviteEmailText({ ...input, inviterName: '   ' })
    expect(text).toContain('A campaign owner invited you')
  })

  it('includes the accept CTA in html', () => {
    const html = buildCampaignInviteEmailHtml(input)
    expect(html).toContain('Accept invitation')
    expect(html).toContain(input.inviteUrl)
  })
})
