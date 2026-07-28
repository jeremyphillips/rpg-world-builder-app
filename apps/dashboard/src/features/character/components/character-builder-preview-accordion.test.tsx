import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  buildCharacterPreview,
  createEmptyCharacterBuilderDraft,
  indexCharacterBuildCatalog,
  isSpellcastingActiveAtLevel,
  resolveAvailableChoices,
  type CharacterBuildContext,
} from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from '../lib/character-builder-fixtures'
import {
  createSpellsStepContextFixture,
  spellsStepWizardCantrips,
  spellsStepWizardClass,
} from '../lib/spells/spells-step.fixtures'
import { CharacterBuilderPreviewAccordion } from './character-builder-preview-accordion.client'

const context = createPopulatedStandaloneBuilderContextFixture()

function renderAccordion(
  draft = createEmptyCharacterBuilderDraft(),
  narrative = draft.identity.narrative,
  options: {
    renderContext?: CharacterBuildContext
    spellcastingActive?: boolean
  } = {},
) {
  const renderContext = options.renderContext ?? context
  const renderCatalogIndex = indexCharacterBuildCatalog(renderContext.catalog)
  const resolvedChoiceSets = resolveAvailableChoices(draft, renderContext)
  const preview = buildCharacterPreview(
    draft,
    renderCatalogIndex,
    renderContext.characterCreationRules,
    renderContext.rulesetId,
    { resolvedChoiceSets },
  )
  const narrativeCount = [
    narrative?.personalityTraits?.length,
    narrative?.ideals?.length,
    narrative?.bonds?.length,
    narrative?.flaws?.length,
    narrative?.backstory?.trim(),
  ].filter(Boolean).length
  const characterClass = draft.class.classId
    ? renderCatalogIndex.classes.get(draft.class.classId)
    : undefined
  const spellcastingActive =
    options.spellcastingActive ??
    (characterClass !== undefined &&
      isSpellcastingActiveAtLevel(characterClass.spellcasting, draft.class.level))

  return render(
    <CharacterBuilderPreviewAccordion
      preview={preview}
      catalogIndex={renderCatalogIndex}
      draft={draft}
      resolvedChoiceSets={resolvedChoiceSets}
      narrative={narrative}
      narrativeCount={narrativeCount}
      hasCharacterClass={characterClass !== undefined}
      spellcastingActive={spellcastingActive}
    />,
  )
}

describe('CharacterBuilderPreviewAccordion', () => {
  it('renders narrative status and populated narrative fields', () => {
    renderAccordion(
      {
        ...createEmptyCharacterBuilderDraft(),
        identity: {
          narrative: {
            ideals: ['Protect the weak.'],
            backstory: '<p>A soldier turned adventurer.</p>',
          },
        },
      },
      {
        ideals: ['Protect the weak.'],
        backstory: '<p>A soldier turned adventurer.</p>',
      },
    )

    expect(screen.getByText('2 fields added.')).toBeInTheDocument()
    expect(screen.getByText('Protect the weak.')).toBeInTheDocument()
    expect(screen.getByText('A soldier turned adventurer.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Combat/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Abilities/i })).toBeInTheDocument()
  })

  it('shows granted common in the languages preview subsection', () => {
    renderAccordion()

    expect(screen.getByText('Common')).toBeInTheDocument()
    expect(screen.queryByText('No languages yet.')).not.toBeInTheDocument()
  })

  it('shows empty narrative status only in the accordion trigger', () => {
    renderAccordion()

    expect(screen.getAllByText('Nothing added yet.')).toHaveLength(1)
  })

  it('lists selected cantrips in the spells preview subsection', () => {
    const spellsContext = createSpellsStepContextFixture()
    const cantripChoiceSetId = `spellcasting:${spellsStepWizardClass.id}:cantrips`

    renderAccordion(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: spellsStepWizardClass.id, level: 1 },
        choiceSelections: {
          [cantripChoiceSetId]: [spellsStepWizardCantrips[0]!.id, spellsStepWizardCantrips[1]!.id],
        },
      },
      undefined,
      { renderContext: spellsContext },
    )

    expect(screen.getByText('Arcane Bolt, Mage Hand')).toBeInTheDocument()
  })

  it('shows pending saving throws and selected skill names', () => {
    renderAccordion({
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
      choiceSelections: {
        'class:srd-cc-5.2.1:fighter:class-skills': ['srd-cc-5.2.1:athletics'],
      },
    })

    expect(screen.getByText(/STR pending, CON pending/)).toBeInTheDocument()
    expect(screen.getByText('Athletics')).toBeInTheDocument()
    expect(screen.getByText('1 skill choice remaining')).toBeInTheDocument()
  })

  it('toggles accordion sections with aria-expanded', async () => {
    renderAccordion()
    const user = userEvent.setup()
    const combatTrigger = screen.getByRole('button', { name: /Combat/i })

    expect(combatTrigger).toHaveAttribute('aria-expanded', 'true')
    await user.click(combatTrigger)
    expect(combatTrigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderAccordion({
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
      abilities: {
        method: 'manual',
        scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      },
    })

    await expectNoAxeViolations(container)
  })
})
