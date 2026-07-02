import { describe, expect, it } from 'vitest'

import {
  equipmentChoiceGrantSchema,
  equipmentGrantSchema,
  equipmentPoolSchema,
  fixedEquipmentGrantSchema,
  formatEquipmentGrantSentence,
  formatEquipmentPoolLabel,
} from './equipment-grant'

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
    expect(
      equipmentPoolSchema.safeParse({
        source: 'filtered',
        equipmentKind: 'weapon',
        toolCategory: 'musical_instrument',
      }).success,
    ).toBe(false)
  })

  it('rejects category filters on kinds without category vocab', () => {
    expect(
      equipmentPoolSchema.safeParse({
        source: 'filtered',
        equipmentKind: 'vehicle',
        weaponCategory: 'simple',
      }).success,
    ).toBe(false)
  })
})

describe('fixedEquipmentGrantSchema', () => {
  it('defaults quantity to 1', () => {
    expect(fixedEquipmentGrantSchema.parse({ kind: 'fixed', equipmentSlug: 'dagger' })).toEqual({
      kind: 'fixed',
      equipmentSlug: 'dagger',
      quantity: 1,
    })
  })

  it('accepts equipped state and modifiers', () => {
    expect(
      fixedEquipmentGrantSchema.parse({
        kind: 'fixed',
        equipmentSlug: 'quarterstaff',
        quantity: 1,
        equipped: false,
        modifiers: [{ kind: 'spellcasting_focus', focusKind: 'druidic_focus' }],
      }),
    ).toMatchObject({
      kind: 'fixed',
      modifiers: [{ kind: 'spellcasting_focus', focusKind: 'druidic_focus' }],
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
  it('round-trips fixed and choice grants', () => {
    const fixed = {
      kind: 'fixed' as const,
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

    expect(equipmentGrantSchema.parse(fixed)).toEqual(fixed)
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
})

describe('formatEquipmentGrantSentence', () => {
  it('formats fixed grants with naive pluralization', () => {
    expect(
      formatEquipmentGrantSentence(
        { kind: 'fixed', equipmentSlug: 'dagger', quantity: 1 },
        () => 'Dagger',
      ),
    ).toBe('Character receives 1 dagger.')

    expect(
      formatEquipmentGrantSentence(
        { kind: 'fixed', equipmentSlug: 'dagger', quantity: 2 },
        () => 'Dagger',
      ),
    ).toBe('Character receives 2 daggers.')
  })

  it('formats filtered pool choices with lowercase category labels', () => {
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
})
