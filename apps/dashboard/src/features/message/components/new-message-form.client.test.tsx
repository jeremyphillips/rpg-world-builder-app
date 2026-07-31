import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

import { NewMessageForm } from './new-message-form.client'

describe('NewMessageForm', () => {
  it('disables submit until a recipient is selected', () => {
    const { rerender } = renderWithProviders(
      <NewMessageForm
        recipients={[{ userId: 'user-2', displayName: 'Campaign Member' }]}
        recipientUserId=""
        onRecipientChange={() => undefined}
        onSubmit={(event) => event.preventDefault()}
        onCancel={() => undefined}
        isSubmitting={false}
      />,
    )

    expect(screen.getByRole('button', { name: 'Start conversation' })).toBeDisabled()

    rerender(
      <NewMessageForm
        recipients={[{ userId: 'user-2', displayName: 'Campaign Member' }]}
        recipientUserId="user-2"
        onRecipientChange={() => undefined}
        onSubmit={(event) => event.preventDefault()}
        onCancel={() => undefined}
        isSubmitting={false}
      />,
    )

    expect(screen.getByRole('button', { name: 'Start conversation' })).toBeEnabled()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <NewMessageForm
        recipients={[{ userId: 'user-2', displayName: 'Campaign Member' }]}
        recipientUserId="user-2"
        onRecipientChange={() => undefined}
        onSubmit={(event) => event.preventDefault()}
        onCancel={() => undefined}
        isSubmitting={false}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
