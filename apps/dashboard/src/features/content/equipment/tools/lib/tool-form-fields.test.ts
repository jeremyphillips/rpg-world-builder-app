import { describe, expect, it } from 'vitest'

import { equipmentFormDef } from '../../lib/equipment-form-def'
import {
  collectGroupLegends,
  expectSeedRoundTrip,
  seedEquipmentOfKind,
  toEquipmentFormValues,
} from '../../lib/test-utils/equipment-form-test-utils'

const TOOL_SEEDS = seedEquipmentOfKind('tool')

describe('tool kindFieldGroups', () => {
  it('buildFields composes identity, economy, and registered tool group', () => {
    const fields = equipmentFormDef.buildFields({ equipmentKind: 'tool' })
    expect(collectGroupLegends(fields)).toEqual(['Identity', 'Economy', 'Tool'])
    expect(fields.some((field) => 'name' in field && field.name === 'utilizes')).toBe(true)
  })
})

describe('tool form round-trips', () => {
  for (const item of TOOL_SEEDS) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      expectSeedRoundTrip(item)
    })

    it(`${item.slug}: preserves tool fields`, () => {
      if (item.kind !== 'tool') return
      const formValues = toEquipmentFormValues(item)
      expect(formValues.toolCategory).toBe(item.toolCategory)
      expect(formValues.ability).toBe(item.ability)
      expect(formValues.utilizes).toEqual(item.utilizes)
      expect(formValues.craftsText).toBe(item.crafts?.length ? item.crafts.join('\n') : undefined)
    })
  }
})
