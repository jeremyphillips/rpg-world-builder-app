import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { NotificationBellMenuBody } from './notification-bell-menu-body'

describe('NotificationBellMenuBody', () => {
  it('renders loading, error, empty, and list states', () => {
    const { rerender } = render(
      <NotificationBellMenuBody isLoading isError={false} itemCount={0} previewItems={[]} />,
    )
    expect(screen.getByText('Loading notifications…')).toBeTruthy()

    rerender(
      <NotificationBellMenuBody
        isLoading={false}
        isError
        itemCount={0}
        previewItems={[]}
        onRetry={vi.fn()}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load notifications.')

    rerender(
      <NotificationBellMenuBody
        isLoading={false}
        isError={false}
        itemCount={0}
        previewItems={[]}
      />,
    )
    expect(screen.getByText('No notifications yet.')).toBeTruthy()

    rerender(
      <NotificationBellMenuBody
        isLoading={false}
        isError={false}
        itemCount={1}
        previewItems={[
          {
            id: 'notification-1',
            title: 'Campaign invitation',
            timestamp: 'Just now',
            unread: true,
            onActivate: () => undefined,
          },
        ]}
      />,
    )
    expect(screen.getByRole('button', { name: 'Unread: Campaign invitation' })).toBeTruthy()
  })

  it('renders message footer links when provided', () => {
    render(
      <MemoryRouter>
        <NotificationBellMenuBody
          isLoading={false}
          isError={false}
          itemCount={0}
          previewItems={[]}
          messagesFooter={{
            viewForCampaignHref: '/messages?campaignId=camp_1',
            viewAllMessagesHref: '/messages',
          }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'View messages for this campaign' })).toHaveAttribute(
      'href',
      '/messages?campaignId=camp_1',
    )
    expect(screen.getByRole('link', { name: 'View all messages' })).toHaveAttribute(
      'href',
      '/messages',
    )
  })

  it('calls retry from the error state', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    render(
      <NotificationBellMenuBody
        isLoading={false}
        isError
        itemCount={0}
        previewItems={[]}
        onRetry={onRetry}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('has no accessibility violations in the list state', async () => {
    const { container } = render(
      <NotificationBellMenuBody
        isLoading={false}
        isError={false}
        itemCount={1}
        previewItems={[
          {
            id: 'notification-1',
            title: 'Invitation accepted',
            description: 'Blake accepted your invitation.',
            timestamp: '2 minutes ago',
            unread: false,
            onActivate: () => undefined,
          },
        ]}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
