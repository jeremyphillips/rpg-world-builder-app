import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  buildCharacterPreview,
  createEmptyCharacterBuilderDraft,
  indexCharacterBuildCatalog,
} from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from '../lib/character-builder-fixtures'
import { CharacterBuilderPreviewAccordion } from './character-builder-preview-accordion.client'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = indexCharacterBuildCatalog(context.catalog)

function renderAccordion(
  draft = createEmptyCharacterBuilderDraft(),
  narrative = draft.identity.narrative,
) {
  const preview = buildCharacterPreview(draft, catalogIndex, context.characterCreationRules)
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
      narrative={narrative}
      narrativeCount={narrativeCount}
      skillChoiceCount={characterClass?.proficiencies.skills?.choose}
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
