import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { CharacterBuilderStepRail } from './character-builder-step-rail.client'

describe('CharacterBuilderStepRail', () => {
  it('renders all builder steps and marks the active step', () => {
    render(
      <CharacterBuilderStepRail
        draft={createEmptyCharacterBuilderDraft()}
        currentStepId="species"
        resolvedChoiceSets={null}
        onStepSelect={() => undefined}
      />,
    )

    expect(screen.getByRole('navigation', { name: 'Character builder steps' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Species/i })).toHaveAttribute('aria-current', 'step')
    expect(screen.getAllByText('Later').length).toBeGreaterThan(0)
  })

  it('calls onStepSelect when a step is clicked', async () => {
    const onStepSelect = vi.fn()

    render(
      <CharacterBuilderStepRail
        draft={createEmptyCharacterBuilderDraft()}
        currentStepId="identity"
        resolvedChoiceSets={null}
        onStepSelect={onStepSelect}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: /Class/i }))
    expect(onStepSelect).toHaveBeenCalledWith('class')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <CharacterBuilderStepRail
        draft={createEmptyCharacterBuilderDraft()}
        currentStepId="identity"
        resolvedChoiceSets={null}
        onStepSelect={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
