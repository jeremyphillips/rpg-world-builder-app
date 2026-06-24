import { describe, expect, it } from 'vitest'
import { loadSeedEquipment } from '@rpg/catalog/equipment'
import { createEquipmentInputSchema } from '@rpg/contracts'

import { equipmentFormDef, type EquipmentFormValues } from '../../lib/equipment-form-def'
import { fieldGroupsForEquipmentKind } from '../../lib/shared/equipment-form-registry'

const TOOL_SEEDS = loadSeedEquipment('srd-cc-5.2.1').filter((item) => item.kind === 'tool')

describe('tool kindFieldGroups', () => {
  it('buildFields composes identity, economy, and registered tool group', () => {
    const fields = equipmentFormDef.buildFields({ equipmentKind: 'tool' })
    const legends = fields
      .filter(
        (field): field is Extract<(typeof fields)[number], { kind: 'group' }> =>
          'kind' in field && field.kind === 'group',
      )
      .map((field) => field.legend)

    expect(legends).toEqual(['Identity', 'Economy', 'Tool'])
    expect(fields.at(-1)).toEqual(fieldGroupsForEquipmentKind('tool')?.[0])
  })
})

describe('tool form round-trips', () => {
  for (const item of TOOL_SEEDS) {
    it(`${item.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      const input = equipmentFormDef.toInput(formValues)
      expect(() => createEquipmentInputSchema.parse(input)).not.toThrow()
    })

    it(`${item.slug}: preserves tool fields`, () => {
      if (item.kind !== 'tool') return
      const formValues = equipmentFormDef.toFormValues(item) as EquipmentFormValues
      expect(formValues.toolCategory).toBe(item.toolCategory)
      expect(formValues.ability).toBe(item.ability)
    })
  }
})
