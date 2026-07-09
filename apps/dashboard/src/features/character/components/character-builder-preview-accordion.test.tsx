import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  buildCharacterPreview,
  createEmptyCharacterBuilderDraft,
  indexCharacterBuildCatalog,
  resolveAvailableChoices,
} from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from '../lib/character-builder-fixtures'
import { CharacterBuilderPreviewAccordion } from './character-builder-preview-accordion.client'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = indexCharacterBuildCatalog(context.catalog)

function renderAccordion(
  draft = createEmptyCharacterBuilderDraft(),
  narrative = draft.identity.narrative,
) {
  const resolvedChoiceSets = resolveAvailableChoices(draft, context)
  const preview = buildCharacterPreview(
    draft,
    catalogIndex,
    context.characterCreationRules,
    context.rulesetId,
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
    ? catalogIndex.classes.get(draft.class.classId)
    : undefined

  return render(
    <CharacterBuilderPreviewAccordion
      preview={preview}
      catalogIndex={catalogIndex}
      draft={draft}
      resolvedChoiceSets={resolvedChoiceSets}
      narrative={narrative}
      narrativeCount={narrativeCount}
      hasCharacterClass={characterClass !== undefined}
      spellcastingActive={false}
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
