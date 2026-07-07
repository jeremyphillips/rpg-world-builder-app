import { describe, expect, it } from 'vitest'

import { formatSelectionSourceLabel } from './format-selection-source-label'

const catalogIndex = {
  classes: new Map([
    ['srd-cc-5.2.1:rogue', { name: 'Rogue' }],
    ['srd-cc-5.2.1:bard', { name: 'Bard' }],
  ]),
}

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
            grantId: 'standard',
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
