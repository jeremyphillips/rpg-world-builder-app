import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { ROUTES } from '@/app/routes'
import { renderWithProviders } from '@/test/render'

import { NotificationBellMenuBody } from './notification-bell-menu-body'
import { NOTIFICATION_COPY } from '../lib/notification-copy'

describe('NotificationBellMenuBody', () => {
  it('renders loading, error, empty, and list states', () => {
    const { unmount: unmountLoading } = renderWithProviders(
      <NotificationBellMenuBody
        isLoading
        isError={false}
        itemCount={0}
        previewItems={[]}
        notificationsViewAllHref={ROUTES.notifications.list}
      />,
    )
    expect(screen.getByText('Loading notifications…')).toBeTruthy()
    unmountLoading()

    const { unmount: unmountError } = renderWithProviders(
      <NotificationBellMenuBody
        isLoading={false}
        isError
        itemCount={0}
        previewItems={[]}
        notificationsViewAllHref={ROUTES.notifications.list}
        onRetry={vi.fn()}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load notifications.')
    unmountError()

    const { unmount: unmountEmpty } = renderWithProviders(
      <NotificationBellMenuBody
        isLoading={false}
        isError={false}
        itemCount={0}
        previewItems={[]}
        notificationsViewAllHref={ROUTES.notifications.list}
      />,
    )
    expect(screen.getByText(NOTIFICATION_COPY.caughtUpTitle)).toBeTruthy()
    unmountEmpty()

    renderWithProviders(
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
        notificationsViewAllHref={ROUTES.notifications.list}
      />,
    )
    expect(screen.getByRole('button', { name: 'Unread: Campaign invitation' })).toBeTruthy()
    expect(screen.queryByText('Open')).not.toBeInTheDocument()
  })

  it('renders campaign message context and view-all footer actions', () => {
    renderWithProviders(
      <NotificationBellMenuBody
        isLoading={false}
        isError={false}
        itemCount={0}
        previewItems={[]}
        notificationsViewAllHref={ROUTES.notifications.list}
        campaignMessagesHref="/messages?campaignId=camp_1"
      />,
      { initialEntries: ['/campaigns/camp_1'] },
    )

    expect(screen.queryByText('Messages')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View messages for this campaign' })).toHaveAttribute(
      'href',
      '/messages?campaignId=camp_1',
    )
    expect(
      screen.getByRole('link', { name: NOTIFICATION_COPY.viewAllNotifications }),
    ).toHaveAttribute('href', ROUTES.notifications.list)
    expect(screen.queryByRole('link', { name: 'View all messages' })).not.toBeInTheDocument()
  })

  it('always renders view-all notifications in the footer', () => {
    renderWithProviders(
      <NotificationBellMenuBody
        isLoading={false}
        isError={false}
        itemCount={1}
        previewItems={[
          {
            id: 'notification-1',
            title: 'New message',
            description: 'Bobby V: blah',
            timestamp: '1 hour ago',
            unread: true,
            onActivate: () => undefined,
          },
        ]}
        notificationsViewAllHref={ROUTES.notifications.list}
      />,
    )

    expect(
      screen.getByRole('link', { name: NOTIFICATION_COPY.viewAllNotifications }),
    ).toBeInTheDocument()
  })

  it('has no accessibility violations in the list state', async () => {
    const { container } = renderWithProviders(
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
        notificationsViewAllHref={ROUTES.notifications.list}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
