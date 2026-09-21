import { describe, expect, it } from 'vitest'

import type { Species } from '../../content/species'
import {
  ORIGIN_PROVENANCE_LABEL,
  formatChoiceSetProvenanceParentContext,
  formatCompactSelectionSourceLabel,
  formatGrantCardSelectionSourceLabel,
  formatSelectionSourceLabel,
  formatStandardSelectionSourceLabel,
  resolveSelectionSourceProvenance,
  type SelectionSourceLabelCatalogIndex,
} from './format-selection-source-label'

const catalogIndex = {
  classes: new Map([
    ['srd-cc-5.2.1:rogue', { name: 'Rogue' }],
    ['srd-cc-5.2.1:bard', { name: 'Bard' }],
    [
      'srd-cc-5.2.1:ranger',
      {
        name: 'Ranger',
        features: [{ id: 'favored-enemy', name: 'Favored Enemy', level: 1 }],
      },
    ],
  ]),
  species: new Map<string, Species>([
    [
      'srd-cc-5.2.1:elf',
      {
        id: 'srd-cc-5.2.1:elf',
        name: 'Elf',
        traits: [
          {
            kind: 'custom',
            id: 'keen-senses',
            name: 'Keen Senses',
          },
        ],
        heritage: {
          id: 'elven-lineage',
          name: 'Elven Lineage',
          choose: 1,
          options: [
            {
              kind: 'custom',
              id: 'high-elf',
              name: 'High Elf',
            },
          ],
        },
      } as Species,
    ],
  ]),
} as unknown as SelectionSourceLabelCatalogIndex

describe('resolveSelectionSourceProvenance', () => {
  it('resolves heritage option grants with container parent context', () => {
    expect(
      resolveSelectionSourceProvenance(
        { kind: 'heritageOption', sourceId: 'srd-cc-5.2.1:elf', grantId: 'high-elf' },
        catalogIndex,
      ),
    ).toEqual({
      sourceKind: 'heritageOption',
      ownerKind: 'heritage',
      primaryLabel: 'High Elf',
      ownerLabel: 'Elven Lineage',
      parentContext: 'Elven Lineage',
    })
  })

  it('resolves class feature grants with feature and class context', () => {
    expect(
      resolveSelectionSourceProvenance(
        {
          kind: 'classFeature',
          sourceId: 'srd-cc-5.2.1:ranger',
          grantId: 'favored-enemy',
        },
        catalogIndex,
      ),
    ).toEqual({
      sourceKind: 'classFeature',
      ownerKind: 'class',
      primaryLabel: 'Favored Enemy',
      ownerLabel: 'Ranger',
      parentContext: 'Ranger feature',
    })
  })

  it('resolves species trait grants with trait and species context', () => {
    expect(
      resolveSelectionSourceProvenance(
        { kind: 'speciesTrait', sourceId: 'srd-cc-5.2.1:elf', grantId: 'keen-senses' },
        catalogIndex,
      ),
    ).toEqual({
      sourceKind: 'speciesTrait',
      ownerKind: 'species',
      primaryLabel: 'Keen Senses',
      ownerLabel: 'Elf',
      parentContext: 'Elf trait',
    })
  })

  it('falls back for synthetic class grants without a matching feature', () => {
    expect(
      resolveSelectionSourceProvenance(
        { kind: 'classFeature', sourceId: 'srd-cc-5.2.1:rogue', grantId: 'saving-throws' },
        catalogIndex,
      ),
    ).toEqual({
      sourceKind: 'classFeature',
      ownerKind: 'class',
      primaryLabel: 'Rogue',
      ownerLabel: 'Rogue',
      parentContext: undefined,
    })
  })

  it('falls back when catalog rows are missing', () => {
    expect(
      resolveSelectionSourceProvenance(
        { kind: 'heritageOption', sourceId: 'missing:elf', grantId: 'high-elf' },
        catalogIndex,
      ),
    ).toEqual({
      sourceKind: 'heritageOption',
      ownerKind: 'heritage',
      primaryLabel: 'Heritage',
      ownerLabel: 'Heritage',
      parentContext: undefined,
    })
  })
})

describe('formatGrantCardSelectionSourceLabel', () => {
  it('formats heritage spell grants for Prestidigitation and Detect Magic', () => {
    const heritageSource = {
      kind: 'heritageOption' as const,
      sourceId: 'srd-cc-5.2.1:elf',
      grantId: 'high-elf',
    }

    expect(formatGrantCardSelectionSourceLabel([heritageSource], catalogIndex)).toBe(
      'Granted by High Elf · Elven Lineage',
    )
  })

  it("formats Favored Enemy Hunter's Mark grants", () => {
    expect(
      formatGrantCardSelectionSourceLabel(
        [
          {
            kind: 'classFeature',
            sourceId: 'srd-cc-5.2.1:ranger',
            grantId: 'favored-enemy',
          },
        ],
        catalogIndex,
      ),
    ).toBe('Granted by Favored Enemy · Ranger feature')
  })

  it('formats species trait grants', () => {
    expect(
      formatGrantCardSelectionSourceLabel(
        [{ kind: 'speciesTrait', sourceId: 'srd-cc-5.2.1:elf', grantId: 'keen-senses' }],
        catalogIndex,
      ),
    ).toBe('Granted by Keen Senses · Elf trait')
  })

  it('falls back for synthetic class grants', () => {
    expect(
      formatGrantCardSelectionSourceLabel(
        [{ kind: 'classFeature', sourceId: 'srd-cc-5.2.1:rogue', grantId: 'saving-throws' }],
        catalogIndex,
      ),
    ).toBe('Granted by Rogue')
  })

  it('joins multiple grant-card labels with middle dots', () => {
    expect(
      formatGrantCardSelectionSourceLabel(
        [
          { kind: 'speciesTrait', sourceId: 'srd-cc-5.2.1:elf', grantId: 'keen-senses' },
          {
            kind: 'classFeature',
            sourceId: 'srd-cc-5.2.1:ranger',
            grantId: 'favored-enemy',
          },
        ],
        catalogIndex,
      ),
    ).toBe('Granted by Keen Senses · Elf trait · Granted by Favored Enemy · Ranger feature')
  })
})

describe('formatStandardSelectionSourceLabel', () => {
  it('formats owner and feature labels when both are present', () => {
    expect(
      formatStandardSelectionSourceLabel(
        [
          {
            kind: 'classFeature',
            sourceId: 'srd-cc-5.2.1:ranger',
            grantId: 'favored-enemy',
          },
        ],
        catalogIndex,
      ),
    ).toBe('Ranger · Favored Enemy')
  })
})

describe('formatChoiceSetProvenanceParentContext', () => {
  it('preserves existing choice-block parent context phrasing', () => {
    expect(
      formatChoiceSetProvenanceParentContext({ ownerKind: 'class', ownerLabel: 'Ranger' }),
    ).toBe('Ranger class')
    expect(
      formatChoiceSetProvenanceParentContext({ ownerKind: 'species', ownerLabel: 'Elf' }),
    ).toBe('Elf species trait')
    expect(
      formatChoiceSetProvenanceParentContext({ ownerKind: 'heritage', ownerLabel: 'High Elf' }),
    ).toBe('High Elf heritage')
  })
})

describe('formatSelectionSourceLabel', () => {
  it('formats class feature and proficiency grants', () => {
    expect(
      formatSelectionSourceLabel(
        [{ kind: 'classFeature', sourceId: 'srd-cc-5.2.1:rogue', grantId: 'saving-throws' }],
        catalogIndex,
      ),
    ).toBe('Granted by Rogue')
  })

  it('prefixes weapon, armor, and tool category rows', () => {
    expect(
      formatSelectionSourceLabel(
        [{ kind: 'classFeature', sourceId: 'srd-cc-5.2.1:rogue', grantId: 'weapon-proficiencies' }],
        catalogIndex,
        { rowKind: 'weaponCategory' },
      ),
    ).toBe('Weapon category · Granted by Rogue')

    expect(
      formatSelectionSourceLabel(
        [{ kind: 'classFeature', sourceId: 'srd-cc-5.2.1:rogue', grantId: 'armor-proficiencies' }],
        catalogIndex,
        { rowKind: 'armorCategory' },
      ),
    ).toBe('Armor training · Granted by Rogue')

    expect(
      formatSelectionSourceLabel(
        [{ kind: 'classFeature', sourceId: 'srd-cc-5.2.1:rogue', grantId: 'tool-proficiencies' }],
        catalogIndex,
        { rowKind: 'toolCategory' },
      ),
    ).toBe('Tool proficiency · Granted by Rogue')
  })

  it('formats equipment inventory source kinds', () => {
    expect(
      formatSelectionSourceLabel(
        [
          {
            kind: 'classStartingEquipment',
            sourceId: 'srd-cc-5.2.1:bard',
            grantId: 'standard-equipment',
          },
        ],
        catalogIndex,
      ),
    ).toBe('From Bard starting equipment')

    expect(formatSelectionSourceLabel([{ kind: 'startingGold' }], catalogIndex)).toBe(
      'Purchased with starting gold',
    )

    expect(formatSelectionSourceLabel([{ kind: 'manual' }], catalogIndex)).toBe('Added manually')
  })

  it('joins duplicate grant sources consistently', () => {
    expect(
      formatSelectionSourceLabel(
        [
          { kind: 'classFeature', sourceId: 'srd-cc-5.2.1:rogue', grantId: 'skill-proficiencies' },
          { kind: 'classFeature', sourceId: 'srd-cc-5.2.1:rogue', grantId: 'class-skills' },
        ],
        catalogIndex,
      ),
    ).toBe('Granted by Rogue')

    expect(
      formatSelectionSourceLabel(
        [
          { kind: 'speciesTrait', sourceId: 'srd-cc-5.2.1:elf', grantId: 'keen-senses' },
          { kind: 'classFeature', sourceId: 'srd-cc-5.2.1:rogue', grantId: 'class-skills' },
        ],
        catalogIndex,
      ),
    ).toBe('Granted by Species, Granted by Rogue')
  })

  it('returns unknown source when provenance is missing', () => {
    expect(formatSelectionSourceLabel(undefined, catalogIndex)).toBe('Unknown source')
    expect(formatSelectionSourceLabel([], catalogIndex)).toBe('Unknown source')
  })
})

describe('formatCompactSelectionSourceLabel', () => {
  it('returns class names without granted-by prose', () => {
    expect(
      formatCompactSelectionSourceLabel(
        [{ kind: 'classFeature', sourceId: 'srd-cc-5.2.1:rogue', grantId: 'saving-throws' }],
        catalogIndex,
      ),
    ).toBe('Rogue')
  })

  it('maps character creation sources to Origin', () => {
    expect(
      formatCompactSelectionSourceLabel(
        [{ kind: 'characterCreation', sourceId: 'srd-cc-5.2.1', grantId: 'language-grants' }],
        catalogIndex,
      ),
    ).toBe(ORIGIN_PROVENANCE_LABEL)
  })

  it('dedupes repeated compact labels', () => {
    expect(
      formatCompactSelectionSourceLabel(
        [
          { kind: 'classFeature', sourceId: 'srd-cc-5.2.1:rogue', grantId: 'skill-proficiencies' },
          { kind: 'classFeature', sourceId: 'srd-cc-5.2.1:rogue', grantId: 'class-skills' },
        ],
        catalogIndex,
      ),
    ).toBe('Rogue')
  })

  it('keeps coarse species and heritage tokens when catalog enrichment is unavailable', () => {
    const classesOnlyIndex = {
      classes: catalogIndex.classes,
      species: new Map<string, Species>(),
    }

    expect(
      formatCompactSelectionSourceLabel(
        [{ kind: 'speciesTrait', sourceId: 'srd-cc-5.2.1:elf', grantId: 'keen-senses' }],
        classesOnlyIndex,
      ),
    ).toBe('Species')

    expect(
      formatCompactSelectionSourceLabel(
        [{ kind: 'heritageOption', sourceId: 'srd-cc-5.2.1:elf', grantId: 'high-elf' }],
        classesOnlyIndex,
      ),
    ).toBe('Heritage')
  })
})
