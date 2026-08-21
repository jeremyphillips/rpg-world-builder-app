import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  createEmptyCharacterBuilderDraft,
  indexCharacterBuildCatalog,
  resolveAvailableChoices,
} from '@rpg/contracts'
import type {
  CharacterBuilderStepId,
  CharacterBuildValidationIssue,
} from '@rpg/contracts/rpg/character-builder'

import { createPopulatedStandaloneBuilderContextFixture } from '../../../lib/fixtures/character-builder-fixtures'
import { createSpellsStepContextFixture } from '../../../lib/spells/spells-step.fixtures'
import { CharacterBuilderStepRail } from './character-builder-step-rail'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = indexCharacterBuildCatalog(context.catalog)

const railProps = {
  context,
  catalogIndex,
  resolvedChoiceSets: null,
  draftValidationIssues: [] as CharacterBuildValidationIssue[],
  validationVisibleStepIds: [] as CharacterBuilderStepId[],
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

  it('shows an error icon only for validation-visible steps', () => {
    render(
      <CharacterBuilderStepRail
        draft={createEmptyCharacterBuilderDraft()}
        currentStepId="species"
        {...railProps}
        validationVisibleStepIds={['identity']}
      />,
    )

    expect(
      screen.getByRole('button', { name: /Identity, has blocking validation issues/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Species, current step/i })).toBeInTheDocument()
  })

  it('does not show an error icon before Continue marks a step validation-visible', () => {
    render(
      <CharacterBuilderStepRail
        draft={createEmptyCharacterBuilderDraft()}
        currentStepId="identity"
        {...railProps}
        draftValidationIssues={[
          { code: 'name_required', message: 'Enter a character name.', stepId: 'identity' },
        ]}
      />,
    )

    expect(screen.getByRole('button', { name: /Identity, current step/i })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Identity, has blocking validation issues/i }),
    ).not.toBeInTheDocument()
  })

  it('does not show an error icon for field edits alone', () => {
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

    expect(screen.getByRole('button', { name: /Identity, not started/i })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Identity, has blocking validation issues/i }),
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

  it('moves focus and selection with arrow keys', async () => {
    const user = userEvent.setup()
    const onStepSelect = vi.fn()

    render(
      <CharacterBuilderStepRail
        draft={createEmptyCharacterBuilderDraft()}
        currentStepId="identity"
        {...railProps}
        onStepSelect={onStepSelect}
      />,
    )

    const identityButton = screen.getByRole('button', { name: /Identity, current step/i })
    identityButton.focus()

    await user.keyboard('{ArrowDown}')

    expect(onStepSelect).toHaveBeenCalledWith('species')
    expect(screen.getByRole('button', { name: /Species, not started/i })).toHaveFocus()
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
        draftValidationIssues={[]}
        validationVisibleStepIds={[]}
        onStepSelect={() => undefined}
      />,
    )

    expect(screen.getByRole('button', { name: /Spells, not applicable/i })).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
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
