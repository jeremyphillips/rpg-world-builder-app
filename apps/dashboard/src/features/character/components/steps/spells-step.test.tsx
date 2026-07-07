import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  buildCharacterPreview,
  createEmptyCharacterBuilderDraft,
  indexCharacterBuildCatalog,
  resolveAvailableChoices,
} from '@rpg/contracts'

import {
  createSpellsStepContextFixture,
  spellsStepWizardCantrips,
  spellsStepWizardClass,
} from '../../lib/spells-step.fixtures'
import { SPELLS_STEP_NON_CASTER_MESSAGE } from '../../lib/spells-step.lib'
import { SpellsStep } from './spells-step.client'

const context = createSpellsStepContextFixture()

describe('SpellsStep', () => {
  it('shows the non-caster locked message for fighter classes', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
    }

    render(
      <SpellsStep
        context={context}
        draft={draft}
        preview={null}
        resolvedChoiceSets={resolveAvailableChoices(draft, context)}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />,
    )

    expect(screen.getByText(SPELLS_STEP_NON_CASTER_MESSAGE)).toBeInTheDocument()
  })

  it('renders spellcasting summary and cantrip choices for a wizard', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: spellsStepWizardClass.id, level: 1 as const },
      abilities: {
        method: 'standard-array' as const,
        scores: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
      },
    }
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)
    const catalogIndex = indexCharacterBuildCatalog(context.catalog)
    const preview = buildCharacterPreview(
      draft,
      catalogIndex,
      context.characterCreationRules,
      context.rulesetId,
      { resolvedChoiceSets },
    )

    render(
      <SpellsStep
        context={context}
        draft={draft}
        preview={preview}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />,
    )

    expect(screen.getByText('Spellcasting ability')).toBeInTheDocument()
    expect(screen.getByText('Intelligence')).toBeInTheDocument()
    expect(screen.getByText('Spell save DC')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('+4')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add cantrip' })).toBeInTheDocument()
  })

  it('persists cantrip selections through draft.choiceSelections', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: spellsStepWizardClass.id, level: 1 as const },
    }
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)
    const cantripChoiceSetId = resolvedChoiceSets.find(
      (choiceSet) => choiceSet.choiceType === 'cantrip',
    )!.id

    render(
      <SpellsStep
        context={context}
        draft={draft}
        preview={null}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={onDraftChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add cantrip' }))
    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]!)

    expect(onDraftChange).toHaveBeenCalledWith({
      choiceSelections: {
        [cantripChoiceSetId]: [spellsStepWizardCantrips[0]!.id],
      },
    })
  })

  it('shows Manage cantrips when the cantrip ChoiceSet is full and keeps the drawer trigger enabled', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: spellsStepWizardClass.id, level: 1 as const },
    }
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)
    const cantripChoiceSetId = resolvedChoiceSets.find(
      (choiceSet) => choiceSet.choiceType === 'cantrip',
    )!.id

    render(
      <SpellsStep
        context={context}
        draft={{
          ...draft,
          choiceSelections: {
            [cantripChoiceSetId]: spellsStepWizardCantrips.map((spell) => spell.id),
          },
        }}
        preview={null}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />,
    )

    const manageButton = screen.getByRole('button', { name: 'Manage cantrips' })
    expect(manageButton).toBeEnabled()
    expect(screen.getByText('Selection full')).toBeInTheDocument()
  })

  it('has no axe accessibility violations for a wizard draft', async () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: spellsStepWizardClass.id, level: 1 as const },
    }

    const { container } = render(
      <SpellsStep
        context={context}
        draft={draft}
        preview={null}
        resolvedChoiceSets={resolveAvailableChoices(draft, context)}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
