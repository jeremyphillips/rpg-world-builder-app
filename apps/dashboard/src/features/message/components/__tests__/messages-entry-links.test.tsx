import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'

import { ROUTES } from '@/app/routes'
import { renderWithProviders } from '@/test/render'
import { MESSAGES_ACTION_COPY } from '../../lib/messages-copy'

import {
  MessagesCampaignEntryLinks,
  MessagesGlobalEntryLink,
  MessagesOverviewEntryActions,
} from '../messages-entry-links'

describe('messages entry links', () => {
  it('links campaign surfaces to scoped and global message routes', () => {
    renderWithProviders(<MessagesCampaignEntryLinks campaignId="camp-1" />)

    expect(
      screen.getByRole('link', { name: MESSAGES_ACTION_COPY.viewForCampaign }),
    ).toHaveAttribute('href', ROUTES.messages.listScoped('camp-1'))
    expect(screen.getByRole('link', { name: MESSAGES_ACTION_COPY.viewAll })).toHaveAttribute(
      'href',
      ROUTES.messages.list,
    )
  })

  it('links overview actions to scoped and global message routes', () => {
    renderWithProviders(<MessagesOverviewEntryActions campaignId="camp-2" />)

    expect(
      screen.getByRole('link', { name: MESSAGES_ACTION_COPY.viewForCampaign }),
    ).toHaveAttribute('href', ROUTES.messages.listScoped('camp-2'))
  })

  it('links global surfaces to the unscoped message list', () => {
    renderWithProviders(<MessagesGlobalEntryLink />)

    expect(screen.getByRole('link', { name: MESSAGES_ACTION_COPY.viewAll })).toHaveAttribute(
      'href',
      ROUTES.messages.list,
    )
  })
})
