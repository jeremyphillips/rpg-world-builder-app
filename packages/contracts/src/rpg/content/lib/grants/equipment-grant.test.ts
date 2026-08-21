import { describe, expect, it } from 'vitest'

import {
  equipmentChoiceGrantSchema,
  equipmentGrantSchema,
  equipmentPoolSchema,
  grantedEquipmentItemSchema,
  formatEquipmentGrantCompact,
  formatEquipmentGrantSentence,
  formatEquipmentPoolLabel,
  type EquipmentGrantCompactResolver,
} from './equipment-grant'
import { grantValidationMessages } from './grant-messages'
import type { EquipmentKind } from '../../equipment'

describe('equipmentPoolSchema', () => {
  it('accepts an explicit slug list', () => {
    expect(
      equipmentPoolSchema.parse({
        source: 'explicit',
        equipmentSlugs: ['dagger', 'shortsword'],
      }),
    ).toEqual({
      source: 'explicit',
      equipmentSlugs: ['dagger', 'shortsword'],
    })
  })

  it('accepts a filtered pool by equipment kind only', () => {
    expect(
      equipmentPoolSchema.parse({
        source: 'filtered',
        equipmentKind: 'mount',
      }),
    ).toEqual({
      source: 'filtered',
      equipmentKind: 'mount',
    })
  })

  it('accepts a filtered pool with a matching category filter', () => {
    expect(
      equipmentPoolSchema.parse({
        source: 'filtered',
        equipmentKind: 'tool',
        toolCategory: 'musical_instrument',
      }),
    ).toEqual({
      source: 'filtered',
      equipmentKind: 'tool',
      toolCategory: 'musical_instrument',
    })
  })

  it('rejects tool categories on a weapon filtered pool', () => {
    const result = equipmentPoolSchema.safeParse({
      source: 'filtered',
      equipmentKind: 'weapon',
      toolCategory: 'musical_instrument',
    })
    expect(result.success).toBe(false)
    if (result.success) throw new Error('Expected invalid filtered pool')
    expect(result.error.issues[0]?.message).toBe(
      grantValidationMessages.categoryFilterWrongKind({
        filterLabel: 'Tool category',
        equipmentKindLabel: 'Tool',
      }),
    )
  })

  it('rejects mismatched category filters on vehicle pools', () => {
    const result = equipmentPoolSchema.safeParse({
      source: 'filtered',
      equipmentKind: 'vehicle',
      weaponCategory: 'simple',
    })
    expect(result.success).toBe(false)
    if (result.success) throw new Error('Expected invalid filtered pool')
    expect(result.error?.issues[0]?.message).toBe(
      grantValidationMessages.categoryFilterWrongKind({
        filterLabel: 'Weapon category',
        equipmentKindLabel: 'Weapon',
      }),
    )
  })

  it('accepts a filtered magic item pool with category and rarity filters', () => {
    expect(
      equipmentPoolSchema.parse({
        source: 'filtered',
        equipmentKind: 'magic_item',
        magicItemCategory: 'wondrous_item',
        magicItemRarity: 'rare',
      }),
    ).toEqual({
      source: 'filtered',
      equipmentKind: 'magic_item',
      magicItemCategory: 'wondrous_item',
      magicItemRarity: 'rare',
    })
  })

  it('accepts vehicle and service category filters on matching kinds', () => {
    expect(
      equipmentPoolSchema.parse({
        source: 'filtered',
        equipmentKind: 'vehicle',
        vehicleCategory: 'water',
      }),
    ).toEqual({
      source: 'filtered',
      equipmentKind: 'vehicle',
      vehicleCategory: 'water',
    })

    expect(
      equipmentPoolSchema.parse({
        source: 'filtered',
        equipmentKind: 'service',
        serviceCategory: 'lodging',
      }),
    ).toEqual({
      source: 'filtered',
      equipmentKind: 'service',
      serviceCategory: 'lodging',
    })
  })

  it('rejects category filters on mount pools', () => {
    const result = equipmentPoolSchema.safeParse({
      source: 'filtered',
      equipmentKind: 'mount',
      vehicleCategory: 'land',
    })
    expect(result.success).toBe(false)
    if (result.success) throw new Error('Expected invalid filtered pool')
    expect(result.error?.issues[0]?.message).toBe(
      grantValidationMessages.categoryFilterNotAllowedForKind({
        filterLabel: 'Vehicle category',
        equipmentKindLabel: 'Mount',
      }),
    )
  })
})

describe('grantedEquipmentItemSchema', () => {
  it('defaults quantity to 1', () => {
    expect(grantedEquipmentItemSchema.parse({ kind: 'grant', equipmentSlug: 'dagger' })).toEqual({
      kind: 'grant',
      equipmentSlug: 'dagger',
      quantity: 1,
    })
  })

  it('accepts equipped state and modifiers', () => {
    expect(
      grantedEquipmentItemSchema.parse({
        kind: 'grant',
        equipmentSlug: 'quarterstaff',
        quantity: 1,
        equipped: false,
        modifiers: [{ kind: 'spellcasting_focus', spellcastingGearKind: 'druidic_focus' }],
      }),
    ).toMatchObject({
      kind: 'grant',
      modifiers: [{ kind: 'spellcasting_focus', spellcastingGearKind: 'druidic_focus' }],
    })
  })
})

describe('equipmentChoiceGrantSchema', () => {
  it('accepts a filtered pool choice', () => {
    expect(
      equipmentChoiceGrantSchema.parse({
        kind: 'choice',
        choose: 1,
        pool: {
          source: 'filtered',
          equipmentKind: 'tool',
          toolCategory: 'musical_instrument',
        },
      }),
    ).toMatchObject({
      kind: 'choice',
      pool: {
        source: 'filtered',
        equipmentKind: 'tool',
        toolCategory: 'musical_instrument',
      },
    })
  })

  it('accepts an explicit pool choice', () => {
    expect(
      equipmentChoiceGrantSchema.parse({
        kind: 'choice',
        choose: 1,
        pool: {
          source: 'explicit',
          equipmentSlugs: ['longsword', 'rapier'],
        },
      }),
    ).toMatchObject({
      pool: { source: 'explicit', equipmentSlugs: ['longsword', 'rapier'] },
    })
  })

  it('normalizes legacy from.toolCategories pools', () => {
    expect(
      equipmentChoiceGrantSchema.parse({
        kind: 'choice',
        choose: 1,
        from: { toolCategories: ['musical_instrument'] },
      }),
    ).toEqual({
      kind: 'choice',
      choose: 1,
      pool: {
        source: 'filtered',
        equipmentKind: 'tool',
        toolCategory: 'musical_instrument',
      },
    })
  })

  it('normalizes legacy from.equipmentSlugs pools', () => {
    expect(
      equipmentChoiceGrantSchema.parse({
        kind: 'choice',
        choose: 1,
        from: { equipmentSlugs: ['longsword', 'rapier'] },
      }),
    ).toEqual({
      kind: 'choice',
      choose: 1,
      pool: { source: 'explicit', equipmentSlugs: ['longsword', 'rapier'] },
    })
  })

  it('strips legacy label and plural pool category arrays', () => {
    expect(
      equipmentChoiceGrantSchema.parse({
        kind: 'choice',
        choose: 1,
        label: 'Musical Instrument',
        pool: {
          source: 'filtered',
          equipmentKind: 'tool',
          toolCategories: ['musical_instrument', 'artisan'],
        },
      }),
    ).toEqual({
      kind: 'choice',
      choose: 1,
      pool: {
        source: 'filtered',
        equipmentKind: 'tool',
        toolCategory: 'musical_instrument',
      },
    })
  })
})

describe('equipmentGrantSchema', () => {
  it('round-trips granted and choice grants', () => {
    const granted = {
      kind: 'grant' as const,
      equipmentSlug: 'leather-armor',
      quantity: 1,
      equipped: true,
    }
    const choice = {
      kind: 'choice' as const,
      choose: 1,
      pool: {
        source: 'filtered' as const,
        equipmentKind: 'weapon' as const,
        weaponCategory: 'simple' as const,
      },
    }

    expect(equipmentGrantSchema.parse(granted)).toEqual(granted)
    expect(equipmentGrantSchema.parse(choice)).toEqual(choice)
  })
})

describe('formatEquipmentPoolLabel', () => {
  it('joins explicit slug lists', () => {
    expect(
      formatEquipmentPoolLabel({
        source: 'explicit',
        equipmentSlugs: ['longsword', 'rapier'],
      }),
    ).toBe('longsword, rapier')
  })

  it('uses a single category label when present', () => {
    expect(
      formatEquipmentPoolLabel({
        source: 'filtered',
        equipmentKind: 'tool',
        toolCategory: 'musical_instrument',
      }),
    ).toBe('Musical Instrument')

    expect(
      formatEquipmentPoolLabel({
        source: 'filtered',
        equipmentKind: 'weapon',
        weaponCategory: 'simple',
      }),
    ).toBe('Simple Weapon')
  })

  it('falls back to the equipment kind label', () => {
    expect(
      formatEquipmentPoolLabel({
        source: 'filtered',
        equipmentKind: 'tool',
      }),
    ).toBe('Tool')

    expect(
      formatEquipmentPoolLabel({
        source: 'filtered',
        equipmentKind: 'mount',
      }),
    ).toBe('Mount')
  })

  it('uses magic item, vehicle, and service category labels when present', () => {
    expect(
      formatEquipmentPoolLabel({
        source: 'filtered',
        equipmentKind: 'magic_item',
        magicItemCategory: 'wondrous_item',
      }),
    ).toBe('Wondrous Item')

    expect(
      formatEquipmentPoolLabel({
        source: 'filtered',
        equipmentKind: 'magic_item',
        magicItemRarity: 'rare',
      }),
    ).toBe('Rare')

    expect(
      formatEquipmentPoolLabel({
        source: 'filtered',
        equipmentKind: 'vehicle',
        vehicleCategory: 'water',
      }),
    ).toBe('Water')

    expect(
      formatEquipmentPoolLabel({
        source: 'filtered',
        equipmentKind: 'service',
        serviceCategory: 'lodging',
      }),
    ).toBe('Lodging')
  })
})

describe('formatEquipmentGrantSentence', () => {
  it('formats granted items with naive pluralization', () => {
    expect(
      formatEquipmentGrantSentence(
        { kind: 'grant', equipmentSlug: 'dagger', quantity: 1 },
        () => 'Dagger',
      ),
    ).toBe('Character receives 1 dagger.')

    expect(
      formatEquipmentGrantSentence(
        { kind: 'grant', equipmentSlug: 'dagger', quantity: 2 },
        () => 'Dagger',
      ),
    ).toBe('Character receives 2 daggers.')
  })

  it('formats filtered pool choices with vocab sentence forms', () => {
    expect(
      formatEquipmentGrantSentence({
        kind: 'choice',
        choose: 1,
        pool: {
          source: 'filtered',
          equipmentKind: 'tool',
          toolCategory: 'musical_instrument',
        },
      }),
    ).toBe('Character chooses 1 musical instrument.')

    expect(
      formatEquipmentGrantSentence({
        kind: 'choice',
        choose: 2,
        pool: {
          source: 'filtered',
          equipmentKind: 'weapon',
          weaponCategory: 'simple',
        },
      }),
    ).toBe('Character chooses 2 simple weapons.')

    expect(
      formatEquipmentGrantSentence({
        kind: 'choice',
        choose: 1,
        pool: {
          source: 'filtered',
          equipmentKind: 'tool',
          toolCategory: 'thieves',
        },
      }),
    ).toBe("Character chooses 1 set of thieves' tools.")

    expect(
      formatEquipmentGrantSentence({
        kind: 'choice',
        choose: 2,
        pool: {
          source: 'filtered',
          equipmentKind: 'armor',
          armorCategory: 'light',
        },
      }),
    ).toBe('Character chooses 2 suits of light armor.')

    expect(
      formatEquipmentGrantSentence({
        kind: 'choice',
        choose: 1,
        pool: {
          source: 'filtered',
          equipmentKind: 'adventuring_gear',
        },
      }),
    ).toBe('Character chooses 1 piece of adventuring gear.')
  })

  it('formats magic item, vehicle, and service filtered pools with vocab sentence forms', () => {
    expect(
      formatEquipmentGrantSentence({
        kind: 'choice',
        choose: 2,
        pool: {
          source: 'filtered',
          equipmentKind: 'magic_item',
          magicItemCategory: 'wondrous_item',
        },
      }),
    ).toBe('Character chooses 2 wondrous items.')

    expect(
      formatEquipmentGrantSentence({
        kind: 'choice',
        choose: 1,
        pool: {
          source: 'filtered',
          equipmentKind: 'magic_item',
          magicItemRarity: 'rare',
        },
      }),
    ).toBe('Character chooses 1 rare magic item.')

    expect(
      formatEquipmentGrantSentence({
        kind: 'choice',
        choose: 2,
        pool: {
          source: 'filtered',
          equipmentKind: 'vehicle',
          vehicleCategory: 'water',
        },
      }),
    ).toBe('Character chooses 2 water vehicles.')

    expect(
      formatEquipmentGrantSentence({
        kind: 'choice',
        choose: 1,
        pool: {
          source: 'filtered',
          equipmentKind: 'service',
          serviceCategory: 'lodging',
        },
      }),
    ).toBe('Character chooses 1 lodging.')
  })

  it('formats explicit pool choices with resolved equipment names', () => {
    expect(
      formatEquipmentGrantSentence(
        {
          kind: 'choice',
          choose: 1,
          pool: {
            source: 'explicit',
            equipmentSlugs: ['rope', 'torch', 'rations'],
          },
        },
        (slug) => ({ rope: 'Rope', torch: 'Torch', rations: 'Rations' })[slug],
      ),
    ).toBe('Character chooses 1 item from: Rope, Torch, Rations.')
  })

  it('returns an empty string for incomplete granted items', () => {
    expect(formatEquipmentGrantSentence({ kind: 'grant', equipmentSlug: '', quantity: 1 })).toBe('')
  })

  it('returns an empty string for filtered pool choices missing equipment kind', () => {
    expect(
      formatEquipmentGrantSentence({
        kind: 'choice',
        choose: 1,
        pool: { source: 'filtered', equipmentKind: undefined as unknown as 'tool' },
      }),
    ).toBe('')
  })
})

describe('formatEquipmentGrantCompact', () => {
  const resolveCatalogEquipment = (slug: string) =>
    ({
      rope: { name: 'Rope', kind: 'adventuring_gear' },
      camel: { name: 'Camel', kind: 'mount' },
      wagon: { name: 'Wagon', kind: 'vehicle' },
      'potion-of-healing': { name: 'Potion of Healing', kind: 'magic_item' },
      messenger: { name: 'Messenger', kind: 'service' },
      'skilled-hireling': { name: 'Skilled Hireling', kind: 'service' },
    })[slug]

  const resolver: EquipmentGrantCompactResolver = {
    resolveEquipmentName: (slug) => resolveCatalogEquipment(slug)?.name,
    resolveEquipmentKind: (slug) =>
      resolveCatalogEquipment(slug)?.kind as EquipmentKind | undefined,
  }

  it('uses resolved names for gear, mounts, vehicles, and magic items', () => {
    expect(
      formatEquipmentGrantCompact({ kind: 'grant', equipmentSlug: 'rope', quantity: 1 }, resolver),
    ).toBe('Rope')
    expect(
      formatEquipmentGrantCompact({ kind: 'grant', equipmentSlug: 'camel', quantity: 1 }, resolver),
    ).toBe('Camel')
    expect(
      formatEquipmentGrantCompact({ kind: 'grant', equipmentSlug: 'wagon', quantity: 1 }, resolver),
    ).toBe('Wagon')
    expect(
      formatEquipmentGrantCompact(
        { kind: 'grant', equipmentSlug: 'potion-of-healing', quantity: 1 },
        resolver,
      ),
    ).toBe('Potion of Healing')
  })

  it('appends service suffixes for service equipment', () => {
    expect(
      formatEquipmentGrantCompact(
        { kind: 'grant', equipmentSlug: 'messenger', quantity: 1 },
        resolver,
      ),
    ).toBe('Messenger service')
    expect(
      formatEquipmentGrantCompact(
        {
          kind: 'choice',
          choose: 1,
          pool: {
            source: 'explicit',
            equipmentSlugs: ['messenger', 'skilled-hireling'],
          },
        },
        resolver,
      ),
    ).toBe('Messenger, Skilled Hireling services')
  })

  it('uses pool labels for filtered equipment choices', () => {
    expect(
      formatEquipmentGrantCompact({
        kind: 'choice',
        choose: 1,
        pool: { source: 'filtered', equipmentKind: 'mount' },
      }),
    ).toBe('Mount')
    expect(
      formatEquipmentGrantCompact({
        kind: 'choice',
        choose: 2,
        pool: {
          source: 'filtered',
          equipmentKind: 'magic_item',
          magicItemCategory: 'wondrous_item',
        },
      }),
    ).toBe('Wondrous Item')
    expect(
      formatEquipmentGrantCompact({
        kind: 'choice',
        choose: 1,
        pool: {
          source: 'filtered',
          equipmentKind: 'service',
          serviceCategory: 'lodging',
        },
      }),
    ).toBe('Lodging service')
  })
})
