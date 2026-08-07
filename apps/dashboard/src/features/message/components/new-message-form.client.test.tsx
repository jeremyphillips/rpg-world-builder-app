import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

import { NewMessageForm } from './new-message-form.client'

describe('NewMessageForm', () => {
  it('renders a recipient combobox without duplicate creation actions', () => {
    renderWithProviders(
      <NewMessageForm
        recipients={[{ userId: 'user-2', displayName: 'Campaign Member' }]}
        recipientUserId="user-2"
        onRecipientChange={() => undefined}
      />,
    )

    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'New message' })).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <NewMessageForm
        recipients={[{ userId: 'user-2', displayName: 'Campaign Member' }]}
        recipientUserId="user-2"
        onRecipientChange={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
