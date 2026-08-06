/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

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
        clearFilterField={vi.fn()}
        resetFilters={vi.fn()}
      />,
    )

    expect(screen.getByText(NOTIFICATION_COPY.inboxDescription)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Unread only' })).toBeInTheDocument()
    expect(screen.getByText('Campaign')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Campaign' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Type' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Clear campaign filter/i })).not.toBeInTheDocument()
    expect(document.querySelector('.bg-surface-subtle')).toBeInTheDocument()
  })

  it('renders active chips and clear-all when multiple filters are active', async () => {
    const user = userEvent.setup()
    const clearFilterField = vi.fn()

    renderWithProviders(
      <NotificationInboxHeader
        schema={schema}
        filters={{ unread: true, category: 'message' }}
        onFilterChange={vi.fn()}
        clearFilterField={clearFilterField}
        resetFilters={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Clear unread only filter' })).toBeInTheDocument()
    expect(screen.getByText('Type: Message')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear all' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear unread only filter' }))
    expect(clearFilterField).toHaveBeenCalledWith('unread')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <NotificationInboxHeader
        schema={schema}
        filters={{ unread: true }}
        onFilterChange={vi.fn()}
        clearFilterField={vi.fn()}
        resetFilters={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
