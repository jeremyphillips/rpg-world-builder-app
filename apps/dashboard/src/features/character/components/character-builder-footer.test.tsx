import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { CharacterBuilderFooter } from './character-builder-footer.client'

describe('CharacterBuilderFooter', () => {
  it('disables create when the character is not ready', () => {
    render(
      <CharacterBuilderFooter
        currentStepId="review"
        canCreateCharacter={false}
        onBack={vi.fn()}
        onContinue={vi.fn()}
        onCreateCharacter={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Create character' })).toBeDisabled()
    expect(
      screen.getByText('Resolve the issues above before creating your character.'),
    ).toBeInTheDocument()
  })

  it('has no axe accessibility violations on review', async () => {
    const { container } = render(
      <CharacterBuilderFooter
        currentStepId="review"
        canCreateCharacter={false}
        onBack={vi.fn()}
        onContinue={vi.fn()}
        onCreateCharacter={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
