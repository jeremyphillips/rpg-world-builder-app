import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { ROUTES } from '@/app/routes'
import { CAMPAIGN_SCOPE_FILTER_ID, INVALID_CAMPAIGN_SCOPE_COPY } from '@/lib/filters'
import { renderWithProviders } from '@/test/render'
import { createMessagesFilterSchema } from '../lib/messages-filter-schema'
import { MESSAGES_SCOPE_COPY, formatMessagesOutOfScopeSupporting } from '../lib/messages-copy'

import {
  MessagesCampaignScopeChrome,
  MessagesOutOfScopePin,
} from './messages-campaign-scope.client'

const schema = createMessagesFilterSchema([{ value: 'camp-1', label: 'Stormwatch' }])!

describe('MessagesCampaignScopeChrome', () => {
  it('omits the hidden utility when hiddenCount is zero', () => {
    renderWithProviders(
      <MessagesCampaignScopeChrome
        schema={schema}
        filters={{ campaignId: 'camp-1' }}
        onFilterChange={vi.fn()}
        clearFilterField={vi.fn()}
        resetFilters={vi.fn()}
        scopedCount={5}
        hiddenCount={0}
        showInvalidScopeNotice={false}
        onDismissInvalidScopeNotice={() => undefined}
      />,
    )

    expect(screen.queryByText(/outside this campaign hidden/i)).not.toBeInTheDocument()
  })

  it('shows full-dataset scope counts independent of the loaded page', async () => {
    const user = userEvent.setup()
    const clearFilterField = vi.fn()

    renderWithProviders(
      <MessagesCampaignScopeChrome
        schema={schema}
        filters={{ campaignId: 'camp-1' }}
        onFilterChange={vi.fn()}
        clearFilterField={clearFilterField}
        resetFilters={vi.fn()}
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

    await user.click(screen.getByRole('button', { name: MESSAGES_SCOPE_COPY.showAllLabel }))
    expect(clearFilterField).toHaveBeenCalledWith(CAMPAIGN_SCOPE_FILTER_ID)
  })

  it('does not render a campaign chip when scoped', () => {
    renderWithProviders(
      <MessagesCampaignScopeChrome
        schema={schema}
        filters={{ campaignId: 'camp-1' }}
        onFilterChange={vi.fn()}
        clearFilterField={vi.fn()}
        resetFilters={vi.fn()}
        scopedCount={10}
        hiddenCount={2}
        showInvalidScopeNotice={false}
        onDismissInvalidScopeNotice={() => undefined}
      />,
      { initialEntries: [ROUTES.messages.listScoped('camp-1')] },
    )

    expect(screen.queryByRole('button', { name: /Clear campaign filter/i })).not.toBeInTheDocument()
  })

  it('shows the invalid scope notice', () => {
    renderWithProviders(
      <MessagesCampaignScopeChrome
        schema={schema}
        filters={{}}
        onFilterChange={vi.fn()}
        clearFilterField={vi.fn()}
        resetFilters={vi.fn()}
        showInvalidScopeNotice
        onDismissInvalidScopeNotice={() => undefined}
      />,
    )

    expect(screen.getByText(INVALID_CAMPAIGN_SCOPE_COPY.invalidHeading)).toBeInTheDocument()
    expect(screen.getByText(INVALID_CAMPAIGN_SCOPE_COPY.invalidBody)).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <MessagesCampaignScopeChrome
        schema={schema}
        filters={{ campaignId: 'camp-1' }}
        onFilterChange={vi.fn()}
        clearFilterField={vi.fn()}
        resetFilters={vi.fn()}
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
