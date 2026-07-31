/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

import { NotificationInboxHeader } from './notification-inbox-header.client'
import { createNotificationInboxFilterSchema } from '../lib/notification-inbox-filter-schema'
import { NOTIFICATION_COPY } from '../lib/notification-copy'

const schema = createNotificationInboxFilterSchema([{ value: 'campaign-1', label: 'Stormwatch' }])

describe('NotificationInboxHeader', () => {
  it('renders the inbox description and inline stacked filter controls', () => {
    renderWithProviders(
      <NotificationInboxHeader
        schema={schema}
        filters={{}}
        onFilterChange={vi.fn()}
        onResetFilters={vi.fn()}
      />,
    )

    expect(screen.getByText(NOTIFICATION_COPY.inboxDescription)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Unread only' })).toBeInTheDocument()
    expect(screen.getByText('Campaign')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Campaign' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Type' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Clear campaign filter/i })).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <NotificationInboxHeader
        schema={schema}
        filters={{ unread: true }}
        onFilterChange={vi.fn()}
        onResetFilters={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
