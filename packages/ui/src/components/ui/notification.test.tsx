import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { NotificationBell } from './notification-bell.client'
import { NotificationEmptyState } from './notification-empty-state'
import { NotificationErrorState } from './notification-error-state'
import { NotificationLoadingState } from './notification-loading-state'
import { NotificationPopoverHeader } from './notification-popover.client'
import { NotificationPreviewItem } from './notification-preview-item.client'
import { NotificationUnreadBadge } from './notification-unread-badge'

describe('NotificationBell', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<NotificationBell unreadCount={2} />)
    await expectNoAxeViolations(container)
  })
})

describe('NotificationUnreadBadge', () => {
  it('formats large counts', () => {
    const { rerender, queryByText } = render(<NotificationUnreadBadge count={0} />)
    expect(queryByText('9+')).toBeNull()

    rerender(<NotificationUnreadBadge count={12} />)
    expect(queryByText('9+')).toBeTruthy()

    rerender(<NotificationUnreadBadge count={120} />)
    expect(queryByText('99+')).toBeTruthy()
  })

  it('uses solid destructive alert styling', () => {
    const { container } = render(<NotificationUnreadBadge count={3} />)
    expect(container.firstChild).toHaveClass('bg-destructive', 'text-destructive-foreground')
  })
})

describe('NotificationPopoverHeader', () => {
  it('renders an eyebrow title and compact mark-all action', () => {
    const { container } = render(
      <NotificationPopoverHeader
        title="Notifications"
        actionLabel="Mark all as read"
        onAction={() => undefined}
      />,
    )

    const heading = screen.getByRole('heading', { name: 'Notifications' })
    expect(heading).toHaveClass('eyebrow-style-sm', 'text-muted-foreground')

    const action = screen.getByRole('button', { name: 'Mark all as read' })
    expect(action).toHaveClass('h-6')
    expect(container.firstChild).toHaveClass('py-1')
  })
})

describe('NotificationPreviewItem', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <NotificationPreviewItem
        title="Invitation accepted"
        description="Ava accepted your invitation."
        timestamp="2m ago"
        unread
        onActivate={() => undefined}
      />,
    )
    await expectNoAxeViolations(container)
  })
})

describe('NotificationEmptyState', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<NotificationEmptyState />)
    await expectNoAxeViolations(container)
  })
})

describe('NotificationLoadingState', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<NotificationLoadingState />)
    await expectNoAxeViolations(container)
  })
})

describe('NotificationErrorState', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<NotificationErrorState onRetry={() => undefined} />)
    await expectNoAxeViolations(container)
  })
})
