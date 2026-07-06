import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { CharacterBuilderFooter } from './character-builder-footer.client'

describe('CharacterBuilderFooter', () => {
  it('submits the active step form when Continue is shown', async () => {
    const onContinue = vi.fn()

    render(
      <form id="identity-form" onSubmit={(event) => event.preventDefault()}>
        <CharacterBuilderFooter
          currentStepId="identity"
          continueFormId="identity-form"
          onBack={() => undefined}
          onContinue={onContinue}
          onCreateCharacter={() => undefined}
        />
      </form>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onContinue).not.toHaveBeenCalled()
  })

  it('shows Create character on the review step', () => {
    render(
      <CharacterBuilderFooter
        currentStepId="review"
        onBack={() => undefined}
        onContinue={() => undefined}
        onCreateCharacter={() => undefined}
      />,
    )

    expect(screen.getByRole('button', { name: 'Create character' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <CharacterBuilderFooter
        currentStepId="class"
        continueFormId="class-form"
        onBack={() => undefined}
        onContinue={() => undefined}
        onCreateCharacter={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
