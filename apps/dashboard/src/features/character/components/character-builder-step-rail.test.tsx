import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  createEmptyCharacterBuilderDraft,
  DEFAULT_ABILITY_GENERATION_RULES,
  indexCharacterBuildCatalog,
  resolveAvailableChoices,
  type CharacterBuilderStepId,
  type CharacterBuildValidationIssue,
} from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from '../lib/character-builder-fixtures'
import { createSpellsStepContextFixture } from '../lib/spells-step.fixtures'
import { CharacterBuilderStepRail } from './character-builder-step-rail.client'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = indexCharacterBuildCatalog(context.catalog)
const standardArray = DEFAULT_ABILITY_GENERATION_RULES.standardArray

const railProps = {
  context,
  catalogIndex,
  resolvedChoiceSets: null,
  validationIssues: [] as CharacterBuildValidationIssue[],
  draftValidationIssues: [] as CharacterBuildValidationIssue[],
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

  it('shows an error icon only after an attempted submit with blocking issues', () => {
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
      screen.getByRole('button', { name: /Identity, has blocking validation issues/i }),
    ).toBeInTheDocument()
  })

  it('does not show an error icon before Continue is attempted', () => {
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
      screen.queryByRole('button', { name: /Identity, has blocking validation issues/i }),
    ).not.toBeInTheDocument()
  })

  it('shows an attention icon when a field-touched step has draft validation issues', () => {
    render(
      <CharacterBuilderStepRail
        draft={{
          ...createEmptyCharacterBuilderDraft(),
          touchedStepIds: ['identity'],
        }}
        currentStepId="species"
        {...railProps}
        draftValidationIssues={[
          { code: 'name_required', message: 'Enter a character name.', stepId: 'identity' },
        ]}
      />,
    )

    expect(
      screen.getByRole('button', { name: /Identity, has incomplete fields/i }),
    ).toBeInTheDocument()
  })

  it('does not show attention when draft issues exist but the step was only navigated to', () => {
    render(
      <CharacterBuilderStepRail
        draft={createEmptyCharacterBuilderDraft()}
        currentStepId="species"
        {...railProps}
        draftValidationIssues={[
          { code: 'name_required', message: 'Enter a character name.', stepId: 'identity' },
        ]}
      />,
    )

    expect(screen.getByRole('button', { name: /Identity, not started/i })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Identity, has incomplete fields/i }),
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

  it('marks non-caster spells as not applicable once choice sets are resolved', () => {
    const spellsContext = createSpellsStepContextFixture()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
    }

    render(
      <CharacterBuilderStepRail
        draft={draft}
        currentStepId="identity"
        context={spellsContext}
        catalogIndex={indexCharacterBuildCatalog(spellsContext.catalog)}
        resolvedChoiceSets={resolveAvailableChoices(draft, spellsContext)}
        validationIssues={[]}
        draftValidationIssues={[]}
        attemptedStepIds={[]}
        standardArray={standardArray}
        onStepSelect={() => undefined}
      />,
    )

    expect(screen.getByRole('button', { name: /Spells, not applicable/i })).toBeInTheDocument()
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
