import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  createEmptyCharacterBuilderDraft,
  DEFAULT_ABILITY_GENERATION_RULES,
  indexCharacterBuildCatalog,
  type CharacterBuilderStepId,
  type CharacterBuildValidationIssue,
} from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from '../lib/character-builder-fixtures'
import { CharacterBuilderStepRail } from './character-builder-step-rail.client'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = indexCharacterBuildCatalog(context.catalog)
const standardArray = DEFAULT_ABILITY_GENERATION_RULES.standardArray

const railProps = {
  context,
  catalogIndex,
  resolvedChoiceSets: null,
  validationIssues: [] as CharacterBuildValidationIssue[],
  attemptedStepIds: [] as CharacterBuilderStepId[],
  standardArray,
  onStepSelect: () => undefined,
}

describe('CharacterBuilderStepRail', () => {
  it('renders all builder steps and marks the active step', () => {
    render(
      <CharacterBuilderStepRail
        draft={createEmptyCharacterBuilderDraft()}
        currentStepId="species"
        {...railProps}
      />,
    )

    expect(screen.getByRole('navigation', { name: 'Character builder steps' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Species, current step/i })).toHaveAttribute(
      'aria-current',
      'step',
    )
  })

  it('keeps the complete icon when revisiting a finished step', () => {
    render(
      <CharacterBuilderStepRail
        draft={{
          ...createEmptyCharacterBuilderDraft(),
          identity: { name: 'Tarin', alignment: 'lg' },
          currentStepId: 'identity',
        }}
        currentStepId="identity"
        {...railProps}
      />,
    )

    expect(screen.getByRole('button', { name: /Identity, complete/i })).toHaveAttribute(
      'aria-current',
      'step',
    )
  })

  it('shows a warning icon only after an attempted submit with blocking issues', () => {
    render(
      <CharacterBuilderStepRail
        draft={createEmptyCharacterBuilderDraft()}
        currentStepId="identity"
        {...railProps}
        validationIssues={[
          { code: 'identity.name.required', message: 'Name is required.', stepId: 'identity' },
        ]}
        attemptedStepIds={['identity']}
      />,
    )

    expect(
      screen.getByRole('button', { name: /Identity, has validation issues/i }),
    ).toBeInTheDocument()
  })

  it('does not show a warning icon before Continue is attempted', () => {
    render(
      <CharacterBuilderStepRail
        draft={createEmptyCharacterBuilderDraft()}
        currentStepId="identity"
        {...railProps}
        validationIssues={[
          { code: 'identity.name.required', message: 'Name is required.', stepId: 'identity' },
        ]}
      />,
    )

    expect(screen.getByRole('button', { name: /Identity, current step/i })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Identity, has validation issues/i }),
    ).not.toBeInTheDocument()
  })

  it('calls onStepSelect when a step is clicked', async () => {
    const onStepSelect = vi.fn()

    render(
      <CharacterBuilderStepRail
        draft={createEmptyCharacterBuilderDraft()}
        currentStepId="identity"
        {...railProps}
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
        {...railProps}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
