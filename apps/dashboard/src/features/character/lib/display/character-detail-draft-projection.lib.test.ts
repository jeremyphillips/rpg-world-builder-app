import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft, resolveAvailableChoices } from '@rpg/contracts'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../fixtures/character-builder-fixtures'
import { SAMPLE_PC } from '../fixtures/character-fixtures'
import { PREVIEW_UNNAMED_CHARACTER } from '../builder-preview/preview-identity-summary'
import { buildCharacterDetailViewModel, toCharacterDetailSource } from './character-display'
import {
  projectCharacterDraftDetailSource,
  projectCharacterBuilderDraftDetailPreview,
} from './character-detail-draft-projection.lib'

describe('character detail draft projection', () => {
  const context = createPopulatedStandaloneBuilderContextFixture()
  const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

  it('matches persisted detail view models through toCharacterDetailSource', () => {
    const fromCharacter = buildCharacterDetailViewModel({
      source: toCharacterDetailSource(SAMPLE_PC),
      catalogIndex,
      rules: context.characterCreationRules,
      xpProgression: { entries: [{ level: 1, xpRequired: 0 }] },
    })

    expect(fromCharacter.identity.summary).toBe('Dwarf · Level 1 Fighter')
    expect(fromCharacter.hitPoints.max).toBe('11')
  })

  it('leaves empty drafts unnamed without invented scores or HP', () => {
    const draft = createEmptyCharacterBuilderDraft()
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)

    const { viewModel, completeness } = projectCharacterDraftDetailSource({
      draft,
      context,
      catalogIndex,
      resolvedChoiceSets,
      xpProgression: { entries: [] },
    })

    expect(viewModel.identity.name).toBe(PREVIEW_UNNAMED_CHARACTER)
    expect(viewModel.abilities.every((tile) => tile.score === '—')).toBe(true)
    expect(viewModel.hitPoints.max).toBe('—')
    expect(viewModel.hitPoints.current).toBe('—')
    expect(completeness.showPreviewNotice).toBe(true)
  })

  it('keeps incomplete builder drafts on the same tolerant projector', () => {
    const draft = createEmptyCharacterBuilderDraft()
    draft.species.speciesId = 'srd-cc-5.2.1:dwarf'
    draft.class.classId = 'srd-cc-5.2.1:fighter'
    draft.class.level = 1

    const failed = projectCharacterBuilderDraftDetailPreview(draft, context, catalogIndex, [])

    expect(failed.completeness.showPreviewNotice).toBe(true)
    expect(failed.viewModel.speciesTraits.items.length).toBeGreaterThan(0)
    expect(failed.viewModel.hitPoints.max).toBe('—')
  })

  it('projects identity and species traits for partially filled drafts', () => {
    const draft = createEmptyCharacterBuilderDraft()
    draft.identity.name = 'Scout'
    draft.species.speciesId = 'srd-cc-5.2.1:dwarf'
    draft.class.classId = 'srd-cc-5.2.1:fighter'
    draft.class.level = 1

    const projected = projectCharacterBuilderDraftDetailPreview(
      draft,
      context,
      catalogIndex,
      resolveAvailableChoices(draft, context),
    )

    expect(projected.viewModel.identity.name).toBe('Scout')
    expect(projected.viewModel.speciesTraits.items.length).toBeGreaterThan(0)
  })
})
