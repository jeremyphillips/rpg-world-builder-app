import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { ROUTES } from '@/app/routes'
import { renderWithProviders } from '@/test/render'
import { MESSAGES_SCOPE_COPY, formatMessagesOutOfScopeSupporting } from '../lib/messages-copy'

import {
  MessagesCampaignScopeChrome,
  MessagesOutOfScopePin,
} from './messages-campaign-scope.client'

describe('MessagesCampaignScopeChrome', () => {
  it('omits the hidden utility when hiddenCount is zero', () => {
    renderWithProviders(
      <MessagesCampaignScopeChrome
        scope={{ campaignId: 'camp-1', campaignName: 'Stormwatch' }}
        scopedCount={5}
        hiddenCount={0}
        showInvalidScopeNotice={false}
        onDismissInvalidScopeNotice={() => undefined}
      />,
    )

    expect(screen.queryByText(/outside this campaign hidden/i)).not.toBeInTheDocument()
  })

  it('shows full-dataset scope counts independent of the loaded page', () => {
    renderWithProviders(
      <MessagesCampaignScopeChrome
        scope={{ campaignId: 'camp-1', campaignName: 'Stormwatch' }}
        scopedCount={42}
        hiddenCount={8}
        showInvalidScopeNotice={false}
        onDismissInvalidScopeNotice={() => undefined}
      />,
      { initialEntries: [ROUTES.messages.listScoped('camp-1')] },
    )

    expect(
      screen.getByText('42 conversations shown · 8 conversations outside this campaign hidden'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: MESSAGES_SCOPE_COPY.showAllLabel })).toHaveAttribute(
      'href',
      ROUTES.messages.list,
    )
  })

  it('shows the invalid scope notice', () => {
    renderWithProviders(
      <MessagesCampaignScopeChrome
        showInvalidScopeNotice
        onDismissInvalidScopeNotice={() => undefined}
      />,
    )

    expect(screen.getByText(MESSAGES_SCOPE_COPY.invalidHeading)).toBeInTheDocument()
    expect(screen.getByText(MESSAGES_SCOPE_COPY.invalidBody)).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <MessagesCampaignScopeChrome
        scope={{ campaignId: 'camp-1', campaignName: 'Stormwatch' }}
        scopedCount={10}
        hiddenCount={2}
        showInvalidScopeNotice={false}
        onDismissInvalidScopeNotice={() => undefined}
      />,
      { initialEntries: [ROUTES.messages.listScoped('camp-1')] },
    )

    await expectNoAxeViolations(container)
  })
})

describe('MessagesOutOfScopePin', () => {
  it('renders locked out-of-scope copy and preserves campaign scope in the thread link', () => {
    renderWithProviders(
      <MessagesOutOfScopePin
        campaignName="Stormwatch"
        campaignId="camp-1"
        conversationId="conv_1"
        peerDisplayName="Campaign Member"
        isActive
      />,
      { initialEntries: [ROUTES.messages.detail('conv_1', { campaignId: 'camp-1' })] },
    )

    expect(screen.getByText(MESSAGES_SCOPE_COPY.outOfScopeEyebrow)).toBeInTheDocument()
    expect(screen.getByText(formatMessagesOutOfScopeSupporting('Stormwatch'))).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Campaign Member/i })).toHaveAttribute(
      'href',
      ROUTES.messages.detail('conv_1', { campaignId: 'camp-1' }),
    )
  })
})
