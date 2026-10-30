import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../equipment'
import { joinInlineMetadata } from '../../../primitives/inline-metadata'
import type { MagicPropertyDefinitionProvider } from './magic-property'
import { resolveEquipmentInstanceSummary } from './resolve-equipment-instance-summary'

const weapon = equipmentSchema.parse({
  id: 'srd-cc-5.2.1:shortsword',
  slug: 'shortsword',
  rulesetId: 'srd-cc-5.2.1',
  catalogLayer: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Shortsword',
  description: '',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 2, unit: 'lb' },
  kind: 'weapon',
  category: 'martial',
  mode: 'melee',
  properties: ['finesse', 'light'],
  mastery: 'vex',
  damage: { dice: { count: 1, faces: 6 } },
  damageType: 'piercing',
})

const ENHANCEMENT_ID = 'srd-cc-5.2.1:weapon-enhancement-1'
const RETURNING_ID = 'prop:returning'
const WARNING_ID = 'prop:warning'

const provider: MagicPropertyDefinitionProvider = (id) => {
  if (id === ENHANCEMENT_ID) {
    return {
      id,
      name: 'Enhancement +1',
      description: '',
      category: 'enhancement',
      appliesTo: ['weapon'],
      effects: [
        { target: 'attack_roll', bonus: 1 },
        { target: 'damage_roll', bonus: 1 },
      ],
    }
  }
  if (id === RETURNING_ID) {
    return {
      id,
      name: 'Returning',
      description: '',
      category: 'special',
      appliesTo: ['weapon'],
      effects: [],
    }
  }
  if (id === WARNING_ID) {
    return {
      id,
      name: 'Warning',
      description: '',
      category: 'special',
      appliesTo: ['weapon'],
      effects: [],
    }
  }
  return undefined
}

type Row = {
  name: string
  entry: Record<string, unknown>
  displayName: string
  equipped: boolean
  magical: boolean
  metadata: string
}

const rows: Row[] = [
  {
    name: 'ordinary equipped',
    entry: { equipped: true },
    displayName: 'Shortsword',
    equipped: true,
    magical: false,
    metadata: '',
  },
  {
    name: 'ordinary unequipped',
    entry: { equipped: false },
    displayName: 'Shortsword',
    equipped: false,
    magical: false,
    metadata: '',
  },
  {
    name: 'magical empty',
    entry: { equipped: true, magical: true },
    displayName: 'Shortsword',
    equipped: true,
    magical: true,
    metadata: '',
  },
  {
    name: 'enhancement +1',
    entry: {
      equipped: true,
      magical: true,
      magicProperties: [{ kind: 'preset', propertyId: ENHANCEMENT_ID }],
    },
    displayName: 'Shortsword +1',
    equipped: true,
    magical: true,
    metadata: '',
  },
  {
    name: 'returning only',
    entry: {
      equipped: true,
      magical: true,
      magicProperties: [{ kind: 'preset', propertyId: RETURNING_ID }],
    },
    displayName: 'Shortsword',
    equipped: true,
    magical: true,
    metadata: 'Returning',
  },
  {
    name: 'returning +1 enhancement',
    entry: {
      equipped: true,
      magical: true,
      magicProperties: [
        { kind: 'preset', propertyId: RETURNING_ID },
        { kind: 'preset', propertyId: ENHANCEMENT_ID },
      ],
    },
    displayName: 'Shortsword +1',
    equipped: true,
    magical: true,
    metadata: 'Returning',
  },
  {
    name: 'returning +1 with adjustment',
    entry: {
      equipped: true,
      magical: true,
      magicProperties: [
        { kind: 'preset', propertyId: RETURNING_ID },
        { kind: 'preset', propertyId: ENHANCEMENT_ID },
      ],
      adjustments: [{ effectId: 'a1', target: 'damage_roll', bonus: 1 }],
    },
    displayName: 'Shortsword +1',
    equipped: true,
    magical: true,
    metadata: 'Returning · +1 adjustment',
  },
  {
    name: 'enhancement +1 with adjustment',
    entry: {
      equipped: true,
      magical: true,
      magicProperties: [{ kind: 'preset', propertyId: ENHANCEMENT_ID }],
      adjustments: [{ effectId: 'a1', target: 'damage_roll', bonus: 1 }],
    },
    displayName: 'Shortsword +1',
    equipped: true,
    magical: true,
    metadata: '+1 adjustment',
  },
  {
    name: 'two named properties',
    entry: {
      equipped: true,
      magical: true,
      magicProperties: [
        { kind: 'preset', propertyId: RETURNING_ID },
        { kind: 'preset', propertyId: WARNING_ID },
      ],
    },
    displayName: 'Shortsword',
    equipped: true,
    magical: true,
    metadata: 'Returning · Warning',
  },
  {
    name: 'three named properties',
    entry: {
      equipped: true,
      magical: true,
      magicProperties: [
        { kind: 'preset', propertyId: RETURNING_ID },
        { kind: 'preset', propertyId: WARNING_ID },
        { kind: 'custom', customId: 'c1', name: 'Glow', description: 'Bright' },
      ],
    },
    displayName: 'Shortsword',
    equipped: true,
    magical: true,
    metadata: 'Returning · Warning · +1 property',
  },
  {
    name: 'nonmagical adjustment',
    entry: {
      equipped: true,
      adjustments: [{ effectId: 'a1', target: 'attack_roll', bonus: 1 }],
    },
    displayName: 'Shortsword',
    equipped: true,
    magical: false,
    metadata: '+1 adjustment',
  },
  {
    name: 'custom name with enhancement',
    entry: {
      customName: 'Bright blade',
      equipped: true,
      magical: true,
      magicProperties: [{ kind: 'preset', propertyId: ENHANCEMENT_ID }],
    },
    displayName: 'Bright blade',
    equipped: true,
    magical: true,
    metadata: '+1 enhancement',
  },
]

describe('resolveEquipmentInstanceSummary', () => {
  it.each(rows)('$name', ({ entry, displayName, equipped, magical, metadata }) => {
    const summary = resolveEquipmentInstanceSummary(
      { equipmentId: weapon.id, ...entry },
      weapon,
      provider,
    )
    expect(summary.displayName).toBe(displayName)
    expect(summary.equipped).toBe(equipped)
    expect(summary.magical).toBe(magical)
    expect(joinInlineMetadata(summary.metadataSegments)).toBe(metadata)
  })

  it('keeps advisories separate from metadata segments', () => {
    const summary = resolveEquipmentInstanceSummary(
      {
        equipmentId: weapon.id,
        magical: true,
        magicProperties: [{ kind: 'preset', propertyId: ENHANCEMENT_ID }],
        adjustments: [{ effectId: 'e1', target: 'attack_roll', bonus: 3 }],
      },
      weapon,
      provider,
    )
    expect(summary.advisories.some((row) => row.code === 'above_standard_enhancement')).toBe(true)
    expect(summary.metadataSegments).toEqual(['+3 adjustment'])
    expect(summary.enhancementInDisplayName).toBe(true)
  })
})
