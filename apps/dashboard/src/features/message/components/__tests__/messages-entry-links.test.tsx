import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'

import { ROUTES } from '@/app/routes'
import { renderWithProviders } from '@/test/render'
import { MESSAGES_ACTION_COPY } from '../../lib/messages-copy'

import { MessagesEntryLinks } from '../messages-entry-links'

describe('messages entry links', () => {
  it('links campaign surfaces to scoped and global message routes', () => {
    renderWithProviders(<MessagesEntryLinks campaignId="camp-1" />)

    expect(
      screen.getByRole('link', { name: MESSAGES_ACTION_COPY.viewForCampaign }),
    ).toHaveAttribute('href', ROUTES.messages.listScoped('camp-1'))
    expect(screen.getByRole('link', { name: MESSAGES_ACTION_COPY.viewAll })).toHaveAttribute(
      'href',
      ROUTES.messages.list,
    )
  })

  it('links overview actions to scoped and global message routes', () => {
    renderWithProviders(<MessagesEntryLinks campaignId="camp-2" tone="overview" />)

    expect(
      screen.getByRole('link', { name: MESSAGES_ACTION_COPY.viewForCampaign }),
    ).toHaveAttribute('href', ROUTES.messages.listScoped('camp-2'))
  })

  it('links global surfaces to the unscoped message list', () => {
    renderWithProviders(<MessagesEntryLinks />)

    expect(screen.getByRole('link', { name: MESSAGES_ACTION_COPY.viewAll })).toHaveAttribute(
      'href',
      ROUTES.messages.list,
    )
  })
})
