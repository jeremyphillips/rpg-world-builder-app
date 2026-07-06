import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  buildCharacterPreview,
  createEmptyCharacterBuilderDraft,
  indexCharacterBuildCatalog,
} from '@rpg/contracts'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderContextFixture,
} from '../lib/character-builder-fixtures'
import {
  PREVIEW_CHOOSE_ALIGNMENT,
  PREVIEW_CHOOSE_SPECIES,
  PREVIEW_UNNAMED_CHARACTER,
} from '../lib/preview-identity-summary'
import { CharacterBuilderPreviewPanel } from './character-builder-preview-panel.client'

describe('CharacterBuilderPreviewPanel', () => {
  it('renders the fixed identity summary and accordion sections', () => {
    const context = createStandaloneBuilderContextFixture()
    const catalogIndex = indexCharacterBuildCatalog(context.catalog)
    const draft = createEmptyCharacterBuilderDraft()
    const preview = buildCharacterPreview(
      draft,
      catalogIndex,
      context.characterCreationRules,
      context.rulesetId,
    )

    render(
      <CharacterBuilderPreviewPanel
        draft={draft}
        context={context}
        catalogIndex={catalogIndex}
        preview={preview}
      />,
    )

    expect(screen.getByText('Preview')).toBeInTheDocument()
    expect(screen.getByText(PREVIEW_UNNAMED_CHARACTER)).toBeInTheDocument()
    expect(screen.getByText('Level 1 · Choose class')).toBeInTheDocument()
    expect(screen.getByText(PREVIEW_CHOOSE_SPECIES)).toBeInTheDocument()
    expect(screen.getByText(PREVIEW_CHOOSE_ALIGNMENT)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Narrative/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Combat/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Abilities/i })).toBeInTheDocument()
    expect(screen.getAllByText('Nothing added yet.').length).toBeGreaterThan(0)
    expect(screen.getByText('HP')).toBeInTheDocument()
    expect(screen.queryByText('Max HP')).not.toBeInTheDocument()
    expect(screen.getByText('STR')).toBeInTheDocument()
    expect(screen.getByText('Choose a class to see options')).toBeInTheDocument()
    expect(
      screen.getByText('Class saving throws appear after you choose a class.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Not applicable for this class.')).toBeInTheDocument()
  })

  it('renders populated identity and class proficiencies when available', () => {
    const context = createPopulatedStandaloneBuilderContextFixture()
    const catalogIndex = indexCharacterBuildCatalog(context.catalog)
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: {
        name: 'Verna',
        alignment: 'ng' as const,
        narrative: {
          ideals: ['Protect the weak.'],
          backstory: '<p>A soldier turned adventurer.</p>',
        },
      },
      species: { speciesId: 'srd-cc-5.2.1:dwarf' },
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
      abilities: {
        method: 'manual' as const,
        scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      },
    }
    const preview = buildCharacterPreview(
      draft,
      catalogIndex,
      context.characterCreationRules,
      context.rulesetId,
    )

    render(
      <CharacterBuilderPreviewPanel
        draft={draft}
        context={context}
        catalogIndex={catalogIndex}
        preview={preview}
      />,
    )

    expect(screen.getByText('Verna')).toBeInTheDocument()
    expect(screen.getByText('Level 1 Fighter')).toBeInTheDocument()
    expect(screen.getByText('Dwarf')).toBeInTheDocument()
    expect(screen.getByText('Neutral Good')).toBeInTheDocument()
    expect(screen.getByText('2 fields added.')).toBeInTheDocument()
    expect(screen.getByText('Protect the weak.')).toBeInTheDocument()
    expect(screen.getByText('2 skill choices remaining')).toBeInTheDocument()
  })

  it('exposes accordion section triggers for keyboard navigation', async () => {
    const context = createStandaloneBuilderContextFixture()
    const catalogIndex = indexCharacterBuildCatalog(context.catalog)
    const draft = createEmptyCharacterBuilderDraft()
    const preview = buildCharacterPreview(
      draft,
      catalogIndex,
      context.characterCreationRules,
      context.rulesetId,
    )
    const user = userEvent.setup()

    render(
      <CharacterBuilderPreviewPanel
        draft={draft}
        context={context}
        catalogIndex={catalogIndex}
        preview={preview}
      />,
    )

    const narrativeTrigger = screen.getByRole('button', { name: /Narrative/i })
    expect(narrativeTrigger).toHaveAttribute('aria-expanded', 'true')

    await user.click(narrativeTrigger)
    expect(narrativeTrigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('has no axe accessibility violations', async () => {
    const context = createPopulatedStandaloneBuilderContextFixture()
    const catalogIndex = indexCharacterBuildCatalog(context.catalog)
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Verna', alignment: 'ng' as const },
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
      abilities: {
        method: 'manual' as const,
        scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      },
    }
    const preview = buildCharacterPreview(
      draft,
      catalogIndex,
      context.characterCreationRules,
      context.rulesetId,
    )

    const { container } = render(
      <CharacterBuilderPreviewPanel
        draft={draft}
        context={context}
        catalogIndex={catalogIndex}
        preview={preview}
      />,
    )
    await expectNoAxeViolations(container)
  })
})
