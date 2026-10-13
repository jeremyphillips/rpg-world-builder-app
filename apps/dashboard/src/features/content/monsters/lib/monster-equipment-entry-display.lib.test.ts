import { describe, expect, it } from 'vitest'
import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'

import { pickEquipment } from '@/test/fixtures/pick'

import { formatMonsterEquipmentRowMetadata } from './monster-equipment-entry-display.lib'

describe('formatMonsterEquipmentRowMetadata', () => {
  it('uses short enhancement metadata and flags unknown presets', () => {
    const longsword = pickEquipment('longsword')
    const provider = createMagicPropertyDefinitionProvider('srd-cc-5.2.1')
    const enhanced = formatMonsterEquipmentRowMetadata({
      entry: {
        entryId: 'e1',
        equipmentId: longsword.id,
        quantity: 1,
        equipped: true,
        magical: true,
        magicProperties: [{ kind: 'preset', propertyId: 'srd-cc-5.2.1:weapon-enhancement-1' }],
      },
      item: longsword,
      provider,
    })
    expect(enhanced).toContain('+1 enhancement')

    const unknown = formatMonsterEquipmentRowMetadata({
      entry: {
        entryId: 'e2',
        equipmentId: longsword.id,
        quantity: 1,
        magical: true,
        magicProperties: [{ kind: 'preset', propertyId: 'gone' }],
      },
      item: longsword,
      provider,
    })
    expect(unknown).toContain('unknown property')
  })
})
