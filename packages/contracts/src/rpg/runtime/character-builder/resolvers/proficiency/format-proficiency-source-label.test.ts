import { describe, expect, it } from 'vitest'

import { indexCharacterBuildCatalog } from '../../context'
import {
  formatProficiencyChoiceSourceLabel,
  formatProficiencySourceLabel,
} from './format-proficiency-source-label'
import { proficiencyTestCatalog, rogueClass } from '../../proficiency-test-fixtures'

describe('formatProficiencySourceLabel', () => {
  const catalogIndex = indexCharacterBuildCatalog(proficiencyTestCatalog)

  it('formats class feature grants', () => {
    expect(
      formatProficiencySourceLabel(
        [{ kind: 'classFeature', sourceId: rogueClass.id, grantId: 'saving-throws' }],
        catalogIndex,
      ),
    ).toBe('Granted by Rogue')
  })

  it('prefixes weapon and armor category rows', () => {
    expect(
      formatProficiencySourceLabel(
        [{ kind: 'classFeature', sourceId: rogueClass.id, grantId: 'weapon-proficiencies' }],
        catalogIndex,
        { rowKind: 'weaponCategory' },
      ),
    ).toBe('Weapon category · Granted by Rogue')

    expect(
      formatProficiencySourceLabel(
        [{ kind: 'classFeature', sourceId: rogueClass.id, grantId: 'armor-proficiencies' }],
        catalogIndex,
        { rowKind: 'armorCategory' },
      ),
    ).toBe('Armor training · Granted by Rogue')
  })

  it('formats choice provenance labels', () => {
    expect(formatProficiencyChoiceSourceLabel('Rogue Skills')).toBe('Chosen from Rogue Skills')
  })
})
