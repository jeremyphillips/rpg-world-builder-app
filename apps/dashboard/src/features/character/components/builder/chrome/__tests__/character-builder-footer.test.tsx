import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { getBuilderChromeCopy } from '../../../../lib/builder/builder-chrome-copy'
import { CharacterBuilderFooter } from '../character-builder-footer'

const pcChrome = getBuilderChromeCopy('standalone_pc')

describe('CharacterBuilderFooter', () => {
  it('disables create when the character is not ready', () => {
    render(
      <CharacterBuilderFooter
        currentStepId="review"
        canCreateCharacter={false}
        createLabel={pcChrome.createLabel}
        creatingLabel={pcChrome.creatingLabel}
        reviewFooterHint={pcChrome.reviewFooterHint}
        onBack={vi.fn()}
        onContinue={vi.fn()}
        onCreateCharacter={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: pcChrome.createLabel })).toBeDisabled()
    expect(screen.getByText(pcChrome.reviewFooterHint)).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations on review', async () => {
    const { container } = render(
      <CharacterBuilderFooter
        currentStepId="review"
        canCreateCharacter={false}
        createLabel={pcChrome.createLabel}
        creatingLabel={pcChrome.creatingLabel}
        reviewFooterHint={pcChrome.reviewFooterHint}
        onBack={vi.fn()}
        onContinue={vi.fn()}
        onCreateCharacter={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
