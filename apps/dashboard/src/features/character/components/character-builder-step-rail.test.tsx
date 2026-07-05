import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { createEmptyCharacterBuilderDraft, indexCharacterBuildCatalog } from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from '../lib/character-builder-fixtures'
import { CharacterBuilderStepRail } from './character-builder-step-rail.client'

const catalogIndex = indexCharacterBuildCatalog(
  createPopulatedStandaloneBuilderContextFixture().catalog,
)

describe('CharacterBuilderStepRail', () => {
  it('renders all builder steps and marks the active step', () => {
    render(
      <CharacterBuilderStepRail
        draft={createEmptyCharacterBuilderDraft()}
        currentStepId="species"
        catalogIndex={catalogIndex}
        resolvedChoiceSets={null}
        validationIssues={[]}
        onStepSelect={() => undefined}
      />,
    )

    expect(screen.getByRole('navigation', { name: 'Character builder steps' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Species, current step/i })).toHaveAttribute(
      'aria-current',
      'step',
    )
  })

  it('shows a warning icon only after attempted validation issues', () => {
    render(
      <CharacterBuilderStepRail
        draft={createEmptyCharacterBuilderDraft()}
        currentStepId="identity"
        catalogIndex={catalogIndex}
        resolvedChoiceSets={null}
        validationIssues={[
          { code: 'identity.name.required', message: 'Name is required.', stepId: 'identity' },
        ]}
        onStepSelect={() => undefined}
      />,
    )

    expect(
      screen.getByRole('button', { name: /Identity, has validation issues/i }),
    ).toBeInTheDocument()
  })

  it('calls onStepSelect when a step is clicked', async () => {
    const onStepSelect = vi.fn()

    render(
      <CharacterBuilderStepRail
        draft={createEmptyCharacterBuilderDraft()}
        currentStepId="identity"
        catalogIndex={catalogIndex}
        resolvedChoiceSets={null}
        validationIssues={[]}
        onStepSelect={onStepSelect}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: /Class, not started/i }))
    expect(onStepSelect).toHaveBeenCalledWith('class')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <CharacterBuilderStepRail
        draft={createEmptyCharacterBuilderDraft()}
        currentStepId="identity"
        catalogIndex={catalogIndex}
        resolvedChoiceSets={null}
        validationIssues={[]}
        onStepSelect={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
