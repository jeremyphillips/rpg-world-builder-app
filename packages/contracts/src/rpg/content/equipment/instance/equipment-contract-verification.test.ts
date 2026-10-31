import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../equipment'
import { equipmentInstanceSchema } from './instance'
import { normalizeEquipmentInstance } from './normalize-equipment-instance'
import { resolveEquipmentEntryEffectTotals } from './equipment-effect-totals'
import type { MagicPropertyDefinitionProvider } from './magic-property'

const weapon = equipmentSchema.parse({
  id: 'srd-cc-5.2.1:longsword',
  slug: 'longsword',
  rulesetId: 'srd-cc-5.2.1',
  catalogLayer: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Longsword',
  description: '',
  cost: { amount: 15, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  kind: 'weapon',
  category: 'martial',
  mode: 'melee',
  properties: ['finesse'],
  mastery: 'nick',
  damage: { dice: { count: 1, faces: 8 } },
  damageType: 'slashing',
})

const provider: MagicPropertyDefinitionProvider = (id) =>
  id === 'srd-cc-5.2.1:weapon-enhancement-1'
    ? {
        id,
        name: 'Enhancement +1',
        description: 'test',
        category: 'enhancement',
        appliesTo: ['weapon'],
        effects: [
          { target: 'attack_roll', bonus: 1 },
          { target: 'damage_roll', bonus: 1 },
        ],
      }
    : undefined

/** §10 contract verification gate — persistence and resolver invariants. */
describe('equipment contract verification (§10)', () => {
  it('keeps entryId, effectId, and customId through parse and normalize', () => {
    const raw = {
      entryId: 'entry-1',
      equipmentId: weapon.id,
      quantity: 2,
      magical: true,
      magicProperties: [
        { kind: 'preset' as const, propertyId: 'srd-cc-5.2.1:weapon-enhancement-1' },
        { kind: 'custom' as const, customId: 'custom-1', name: 'Glow', description: 'Shines' },
      ],
      mechanicalEffects: [{ effectId: 'fx-1', target: 'attack_roll' as const, bonus: 1 }],
    }
    const parsed = equipmentInstanceSchema.parse(raw)
    const normalized = normalizeEquipmentInstance(parsed)
    expect(normalized).toMatchObject({
      magical: true,
      magicProperties: raw.magicProperties,
      adjustments: [{ effectId: 'fx-1', target: 'attack_roll', bonus: 1 }],
    })
    expect(normalized).not.toHaveProperty('mechanicalEffects')
    expect(normalizeEquipmentInstance(normalized)).toEqual(normalized)
  })

  it('does not multiply attack bonuses by stack quantity', () => {
    const totals = resolveEquipmentEntryEffectTotals(
      {
        equipmentId: weapon.id,
        quantity: 4,
        magical: true,
        magicProperties: [{ kind: 'preset', propertyId: 'srd-cc-5.2.1:weapon-enhancement-1' }],
      },
      weapon,
      provider,
    )
    expect(totals.attack_roll).toBe(1)
    expect(totals.damage_roll).toBe(1)
  })
})
