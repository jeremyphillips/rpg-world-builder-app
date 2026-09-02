import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'
import { MESSAGES_ACTION_COPY } from '../../../lib/messages-copy'

import { MessageComposer } from '../message-composer'

describe('MessageComposer', () => {
  it('submits on Enter and preserves Shift+Enter for newlines', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    renderWithProviders(
      <MessageComposer
        draft="Hello"
        onDraftChange={() => undefined}
        onSubmit={onSubmit}
        isSubmitting={false}
      />,
    )

    const textarea = screen.getByLabelText('Message')
    await user.type(textarea, '{Enter}')
    expect(onSubmit).toHaveBeenCalledTimes(1)

    await user.type(textarea, '{Shift>}{Enter}{/Shift}')
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('disables send when draft is blank', () => {
    renderWithProviders(
      <MessageComposer
        draft="   "
        onDraftChange={() => undefined}
        onSubmit={() => undefined}
        isSubmitting={false}
      />,
    )

    expect(screen.getByRole('button', { name: MESSAGES_ACTION_COPY.send })).toBeDisabled()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <MessageComposer
        draft="Ready to send"
        onDraftChange={() => undefined}
        onSubmit={() => undefined}
        isSubmitting={false}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
