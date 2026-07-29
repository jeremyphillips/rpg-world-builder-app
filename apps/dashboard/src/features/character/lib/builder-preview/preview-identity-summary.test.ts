import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft, indexCharacterBuildCatalog } from '@rpg/contracts'

import { pickSpecies } from '@/features/content/lib/fixtures/pick'

import {
  createPopulatedStandaloneBuilderContextFixture,
  populatedBuilderCatalog,
} from '../character-builder-fixtures'
import {
  getPreviewAlignmentLine,
  getPreviewIdentityName,
  getPreviewLevelClassLine,
  getPreviewSpeciesLine,
  PREVIEW_CHOOSE_ALIGNMENT,
  PREVIEW_CHOOSE_CLASS,
  PREVIEW_CHOOSE_SPECIES,
  PREVIEW_UNNAMED_CHARACTER,
} from './preview-identity-summary'

const catalogIndex = indexCharacterBuildCatalog(
  createPopulatedStandaloneBuilderContextFixture().catalog,
)

describe('preview identity summary helpers', () => {
  it('renders placeholder lines for an empty draft', () => {
    const draft = createEmptyCharacterBuilderDraft()

    expect(getPreviewIdentityName(draft)).toBe(PREVIEW_UNNAMED_CHARACTER)
    expect(getPreviewLevelClassLine(draft, catalogIndex)).toBe(`Level 1 · ${PREVIEW_CHOOSE_CLASS}`)
    expect(getPreviewSpeciesLine(draft, catalogIndex)).toBe(PREVIEW_CHOOSE_SPECIES)
    expect(getPreviewAlignmentLine(draft)).toBe(PREVIEW_CHOOSE_ALIGNMENT)
  })

  it('renders populated identity lines from draft and catalog', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Tarin', alignment: 'lg' as const },
      species: { speciesId: 'srd-cc-5.2.1:dwarf' },
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
    }

    expect(getPreviewIdentityName(draft)).toBe('Tarin')
    expect(getPreviewLevelClassLine(draft, catalogIndex)).toBe('Level 1 Fighter')
    expect(getPreviewSpeciesLine(draft, catalogIndex)).toBe('Dwarf')
    expect(getPreviewAlignmentLine(draft)).toBe('Lawful Good')
  })

  it('appends heritage to the species line when set', () => {
    const elf = pickSpecies('elf')
    const catalogIndex = indexCharacterBuildCatalog({
      ...populatedBuilderCatalog,
      species: [...populatedBuilderCatalog.species, elf],
    })
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: elf.id, heritageId: 'high-elf' },
    }

    expect(getPreviewSpeciesLine(draft, catalogIndex)).toBe('Elf (High Elf)')
  })
})
