import { describe, expect, it } from 'vitest'

import {
  contentGrantSchema,
  contentGrantsSchema,
  contentTraitSchema,
  customContentTraitSchema,
  featChoiceGrantSchema,
  flattenGrantGroups,
  formatDamageTypeGrantSentence,
  formatFeatChoiceGrantSentence,
  formatLanguageChoiceGrantSentence,
  formatLanguageGrantSentence,
  formatResistanceGrantSentence,
  formatSenseGrantSentence,
  formatSpellsGrantSentence,
  getGrantGroupEffectiveUnlock,
  getUnlockedGrantsAtLevel,
  grantContentTraitSchema,
  grantGroupsSchema,
  innateSpellEntrySchema,
  isGrantEligibleGrants,
  isGrantGroupsEligible,
  languageChoiceGrantSchema,
  normalizeContentTrait,
  normalizeGrantGroups,
} from './grants'
import { resolveTraitDisplay } from './trait-display'

describe('isGrantEligibleGrants', () => {
  it('accepts a single sense grant', () => {
    expect(isGrantEligibleGrants({ senses: [{ type: 'darkvision', range: 60 }] })).toBe(true)
  })

  it('rejects multi-key grant bags', () => {
    expect(
      isGrantEligibleGrants({
        senses: [{ type: 'darkvision', range: 120 }],
        innateSpells: {
          ability: 'cha',
          entries: [{ level: 1, kind: 'free_cast' as const, spellIds: ['dancing-lights'] }],
        },
      }),
    ).toBe(false)
  })

  it('rejects innateSpells-only grants', () => {
    expect(
      isGrantEligibleGrants({
        innateSpells: {
          ability: 'cha',
          entries: [{ level: 1, kind: 'free_cast' as const, spellIds: ['dancing-lights'] }],
        },
      }),
    ).toBe(false)
  })

  it('rejects equipment-only grants', () => {
    expect(
      isGrantEligibleGrants({
        equipment: [{ kind: 'fixed', equipmentSlug: 'dagger', quantity: 1 }],
      }),
    ).toBe(false)
  })
})

describe('innateSpellEntrySchema', () => {
  it('defaults kind to free_cast when omitted', () => {
    const result = innateSpellEntrySchema.parse({
      level: 1,
      spellIds: ['dancing-lights'],
      frequency: 'at_will',
    })
    expect(result.kind).toBe('free_cast')
  })

  it('parses free_cast with frequency', () => {
    expect(
      innateSpellEntrySchema.safeParse({
        level: 3,
        spellIds: ['faerie-fire'],
        kind: 'free_cast',
        frequency: 'once_per_long_rest',
      }).success,
    ).toBe(true)
  })

  it('parses always_prepared without frequency', () => {
    const result = innateSpellEntrySchema.parse({
      level: 20,
      kind: 'always_prepared',
      spellIds: ['power-word-heal', 'power-word-kill'],
    })
    expect(result).toEqual({
      level: 20,
      kind: 'always_prepared',
      spellIds: ['power-word-heal', 'power-word-kill'],
    })
  })

  it('rejects always_prepared with frequency', () => {
    expect(
      innateSpellEntrySchema.safeParse({
        level: 20,
        kind: 'always_prepared',
        spellIds: ['power-word-heal'],
        frequency: 'at_will',
      }).success,
    ).toBe(false)
  })
})

describe('featChoiceGrantSchema', () => {
  it('parses a fighting-style feat choice', () => {
    expect(
      featChoiceGrantSchema.parse({
        category: 'fighting-style',
        choose: 1,
        replaceable: true,
      }),
    ).toEqual({
      category: 'fighting-style',
      choose: 1,
      replaceable: true,
    })
  })

  it('defaults choose to 1', () => {
    expect(featChoiceGrantSchema.parse({ category: 'origin' })).toEqual({
      category: 'origin',
      choose: 1,
    })
  })

  it('parses epic boon with allowAnyQualifying', () => {
    expect(
      featChoiceGrantSchema.parse({
        category: 'epic-boon',
        choose: 1,
        allowAnyQualifying: true,
      }),
    ).toEqual({
      category: 'epic-boon',
      choose: 1,
      allowAnyQualifying: true,
    })
  })

  it('rejects allowAnyQualifying on non-epic-boon/non-general categories', () => {
    expect(
      featChoiceGrantSchema.safeParse({
        category: 'fighting-style',
        allowAnyQualifying: true,
      }).success,
    ).toBe(false)
  })

  it('parses general ASI with allowAnyQualifying and recommendedFeatIds', () => {
    expect(
      featChoiceGrantSchema.parse({
        category: 'general',
        choose: 1,
        allowAnyQualifying: true,
        recommendedFeatIds: ['ability-score-improvement'],
      }),
    ).toEqual({
      category: 'general',
      choose: 1,
      allowAnyQualifying: true,
      recommendedFeatIds: ['ability-score-improvement'],
    })
  })
})

describe('languageChoiceGrantSchema', () => {
  it('parses a category-based language choice', () => {
    expect(languageChoiceGrantSchema.parse({ choose: 2, categories: ['standard'] })).toEqual({
      choose: 2,
      categories: ['standard'],
    })
  })

  it('parses a fixed-pool language choice', () => {
    expect(languageChoiceGrantSchema.parse({ choose: 1, from: ['common', 'elvish'] })).toEqual({
      choose: 1,
      from: ['common', 'elvish'],
    })
  })

  it('requires an explicit choice pool', () => {
    expect(languageChoiceGrantSchema.safeParse({ choose: 1 }).success).toBe(false)
  })

  it('defaults choose to 1 when a pool is provided', () => {
    expect(languageChoiceGrantSchema.parse({ categories: ['standard'] })).toEqual({
      choose: 1,
      categories: ['standard'],
    })
  })
})

describe('grant sentence formatters', () => {
  it('formats damage and resistance grants with damage sentence forms', () => {
    expect(formatDamageTypeGrantSentence(['fire', 'cold'])).toBe(
      'Character chooses from fire damage and cold damage.',
    )
    expect(formatResistanceGrantSentence(['poison'])).toBe(
      'Character gains Resistance to poison damage.',
    )
  })

  it('formats sense and language grants with sentence forms', () => {
    expect(formatSenseGrantSentence({ type: 'darkvision', range: 60 })).toBe(
      'Character gains Darkvision with a range of 60 feet.',
    )
    expect(formatLanguageGrantSentence(['common'])).toBe('Character knows Common.')
  })

  it('formats language and feat choices with counted forms', () => {
    expect(formatLanguageChoiceGrantSentence({ choose: 2, categories: ['standard'] })).toBe(
      'Character chooses 2 languages from standard languages.',
    )
    expect(formatFeatChoiceGrantSentence({ category: 'general', choose: 2 })).toBe(
      'Character chooses 2 general feats.',
    )
  })

  it('formats spell grants with usage-frequency cadence prose', () => {
    expect(
      formatSpellsGrantSentence({
        kind: 'spells',
        ability: 'cha',
        mode: 'free_cast',
        frequency: 'at_will',
        spellIds: ['dancing-lights'],
      }),
    ).toBe('Character can cast dancing-lights at will.')

    expect(
      formatSpellsGrantSentence(
        {
          kind: 'spells',
          ability: 'cha',
          mode: 'free_cast',
          frequency: 'once_per_long_rest',
          spellIds: ['faerie-fire', 'darkness'],
        },
        (id) => ({ 'faerie-fire': 'Faerie Fire', darkness: 'Darkness' })[id],
      ),
    ).toBe('Character can cast Faerie Fire and Darkness once per long rest.')

    expect(
      formatSpellsGrantSentence(
        {
          kind: 'spells',
          ability: 'wis',
          mode: 'always_prepared',
          spellIds: ['cure-wounds'],
        },
        () => 'Cure Wounds',
      ),
    ).toBe('Character has Cure Wounds always prepared.')
  })
})

describe('contentGrantsSchema', () => {
  it('parses a grants bag with innateSpells', () => {
    const grants = {
      innateSpells: {
        ability: 'cha' as const,
        entries: [
          {
            level: 20,
            kind: 'always_prepared' as const,
            spellIds: ['power-word-heal', 'power-word-kill'],
          },
        ],
      },
    }
    expect(contentGrantsSchema.parse(grants)).toEqual(grants)
  })

  it('parses a grants bag with featChoice', () => {
    const grants = {
      featChoice: {
        category: 'origin' as const,
        choose: 1,
      },
    }
    expect(contentGrantsSchema.parse(grants)).toEqual(grants)
  })

  it('parses fixed language grants and language choices', () => {
    const grants = {
      languages: ['thieves-cant' as const],
      languageChoices: [{ choose: 1, categories: ['standard' as const] }],
    }
    expect(contentGrantsSchema.parse(grants)).toEqual(grants)
  })

  it('rejects display labels in fixed language grants', () => {
    expect(contentGrantsSchema.safeParse({ languages: ['Common'] }).success).toBe(false)
  })

  it('parses equipment grant arrays', () => {
    const grants = {
      equipment: [
        { kind: 'fixed' as const, equipmentSlug: 'dagger', quantity: 1 },
        {
          kind: 'choice' as const,
          choose: 1,
          pool: {
            source: 'filtered' as const,
            equipmentKind: 'tool' as const,
            toolCategory: 'musical_instrument' as const,
          },
        },
      ],
    }
    expect(contentGrantsSchema.parse(grants)).toEqual(grants)
  })
})

describe('customContentTraitSchema', () => {
  it('parses a custom trait with optional grants', () => {
    const trait = {
      kind: 'custom' as const,
      id: 'fey-ancestry',
      name: 'Fey Ancestry',
      description: '<p>Advantage on Charm saves.</p>',
    }
    expect(customContentTraitSchema.parse(trait)).toEqual(trait)
  })
})

describe('grantContentTraitSchema', () => {
  it('parses a grant-only darkvision trait using grantGroups', () => {
    const trait = {
      kind: 'grant' as const,
      id: 'darkvision',
      grantGroups: [{ grants: [{ kind: 'sense' as const, type: 'darkvision', range: 60 }] }],
    }
    expect(grantContentTraitSchema.parse(trait)).toEqual(trait)
  })

  it('parses a grant trait with a nameOverride', () => {
    const trait = {
      kind: 'grant' as const,
      id: 'darkvision-superior',
      grantGroups: [{ grants: [{ kind: 'sense' as const, type: 'darkvision', range: 120 }] }],
      nameOverride: 'Superior Darkvision',
    }
    expect(grantContentTraitSchema.parse(trait)).toEqual(trait)
  })

  it('rejects ineligible grantGroups (multiple grants in group)', () => {
    expect(
      grantContentTraitSchema.safeParse({
        kind: 'grant',
        id: 'drow',
        grantGroups: [
          {
            grants: [
              { kind: 'sense', type: 'darkvision', range: 120 },
              { kind: 'spells', ability: 'cha', mode: 'free_cast', spellIds: ['dancing-lights'] },
            ],
          },
        ],
      }).success,
    ).toBe(false)
  })

  it('rejects ineligible grantGroups (spells-only grant)', () => {
    expect(
      grantContentTraitSchema.safeParse({
        kind: 'grant',
        id: 'drow-magic',
        grantGroups: [
          {
            grants: [
              { kind: 'spells', ability: 'cha', mode: 'free_cast', spellIds: ['dancing-lights'] },
            ],
          },
        ],
      }).success,
    ).toBe(false)
  })
})

describe('contentTraitSchema', () => {
  it('parses grant and custom variants', () => {
    expect(
      contentTraitSchema.parse({
        kind: 'grant',
        id: 'darkvision',
        grantGroups: [{ grants: [{ kind: 'sense', type: 'darkvision', range: 60 }] }],
      }),
    ).toMatchObject({ kind: 'grant', id: 'darkvision' })

    expect(
      contentTraitSchema.parse({
        kind: 'custom',
        id: 'rage',
        name: 'Rage',
        description: '<p>Enter a rage.</p>',
      }),
    ).toMatchObject({ kind: 'custom', name: 'Rage' })
  })

  it('normalizes legacy traits without kind to custom', () => {
    const trait = {
      id: 'darkvision',
      name: 'Darkvision',
      description: '<p>You have Darkvision with a range of 60 feet.</p>',
      grants: { senses: [{ type: 'darkvision' as const, range: 60 }] },
    }
    expect(contentTraitSchema.parse(trait)).toEqual({
      ...trait,
      kind: 'custom',
    })
  })
})

describe('normalizeContentTrait', () => {
  it('leaves explicit kind unchanged', () => {
    expect(
      normalizeContentTrait({
        kind: 'grant',
        id: 'darkvision',
        grantGroups: [{ grants: [{ kind: 'sense', type: 'darkvision', range: 60 }] }],
      }),
    ).toMatchObject({ kind: 'grant' })
  })
})

describe('resolveTraitDisplay', () => {
  it('derives darkvision display from grant traits (grantGroups model)', () => {
    const display = resolveTraitDisplay(
      contentTraitSchema.parse({
        kind: 'grant',
        id: 'darkvision',
        grantGroups: [{ grants: [{ kind: 'sense', type: 'darkvision', range: 60 }] }],
      }),
    )
    expect(display.name).toBe('Darkvision')
    expect(display.descriptionHtml).toBe('<p>You have Darkvision with a range of 60 feet.</p>')
  })

  it('uses overrides on grant traits when present', () => {
    const display = resolveTraitDisplay(
      grantContentTraitSchema.parse({
        kind: 'grant',
        id: 'darkvision',
        grantGroups: [{ grants: [{ kind: 'sense', type: 'darkvision', range: 120 }] }],
        nameOverride: 'Superior Darkvision',
        descriptionOverride: '<p>Custom homebrew wording.</p>',
      }),
    )
    expect(display.name).toBe('Superior Darkvision')
    expect(display.descriptionHtml).toBe('<p>Custom homebrew wording.</p>')
  })
})

// ---------------------------------------------------------------------------
// Atomic contentGrantSchema
// ---------------------------------------------------------------------------

describe('contentGrantSchema — sense', () => {
  it('parses a sense grant', () => {
    expect(contentGrantSchema.parse({ kind: 'sense', type: 'darkvision', range: 60 })).toEqual({
      kind: 'sense',
      type: 'darkvision',
      range: 60,
    })
  })
})

describe('contentGrantSchema — resistances', () => {
  it('parses a resistances grant', () => {
    expect(contentGrantSchema.parse({ kind: 'resistances', damageTypes: ['fire'] })).toEqual({
      kind: 'resistances',
      damageTypes: ['fire'],
    })
  })
  it('rejects empty damageTypes', () => {
    expect(contentGrantSchema.safeParse({ kind: 'resistances', damageTypes: [] }).success).toBe(
      false,
    )
  })
})

describe('contentGrantSchema — damageType', () => {
  it('parses a damageType grant', () => {
    expect(contentGrantSchema.parse({ kind: 'damageType', damageTypes: ['fire', 'acid'] })).toEqual(
      { kind: 'damageType', damageTypes: ['fire', 'acid'] },
    )
  })
})

describe('contentGrantSchema — movement', () => {
  it('parses a walk speed bonus', () => {
    expect(
      contentGrantSchema.parse({
        kind: 'movement',
        mode: 'walk',
        operation: 'bonus',
        value: 5,
        unit: 'ft',
      }),
    ).toEqual({
      kind: 'movement',
      mode: 'walk',
      operation: 'bonus',
      value: 5,
      unit: 'ft',
    })
  })
})

describe('contentGrantSchema — weaponProficiency', () => {
  it('parses a weapon proficiency grant', () => {
    expect(
      contentGrantSchema.parse({
        kind: 'weaponProficiency',
        grant: { kind: 'fixed', weaponCategories: ['simple'] },
      }),
    ).toEqual({
      kind: 'weaponProficiency',
      grant: { kind: 'fixed', weaponCategories: ['simple'] },
    })
  })
})

describe('contentGrantSchema — skillProficiency', () => {
  it('parses a skill proficiency grant', () => {
    expect(
      contentGrantSchema.parse({
        kind: 'skillProficiency',
        grant: { kind: 'fixed', skillIds: ['athletics', 'stealth'] },
      }),
    ).toEqual({
      kind: 'skillProficiency',
      grant: { kind: 'fixed', skillIds: ['athletics', 'stealth'] },
    })
  })
})

describe('contentGrantSchema — languages', () => {
  it('parses a languages grant', () => {
    expect(
      contentGrantSchema.parse({ kind: 'languages', languageIds: ['common', 'elvish'] }),
    ).toEqual({ kind: 'languages', languageIds: ['common', 'elvish'] })
  })
  it('rejects empty languageIds', () => {
    expect(contentGrantSchema.safeParse({ kind: 'languages', languageIds: [] }).success).toBe(false)
  })
})

describe('contentGrantSchema — languageChoice', () => {
  it('parses with categories', () => {
    expect(contentGrantSchema.parse({ kind: 'languageChoice', categories: ['standard'] })).toEqual({
      kind: 'languageChoice',
      choose: 1,
      categories: ['standard'],
    })
  })
  it('rejects without from or categories', () => {
    expect(contentGrantSchema.safeParse({ kind: 'languageChoice', choose: 1 }).success).toBe(false)
  })
})

describe('contentGrantSchema — featChoice', () => {
  it('parses a feat choice grant', () => {
    expect(
      contentGrantSchema.parse({
        kind: 'featChoice',
        category: 'general',
        allowAnyQualifying: true,
      }),
    ).toEqual({ kind: 'featChoice', category: 'general', choose: 1, allowAnyQualifying: true })
  })
  it('rejects allowAnyQualifying on non-eligible categories', () => {
    expect(
      contentGrantSchema.safeParse({
        kind: 'featChoice',
        category: 'fighting-style',
        allowAnyQualifying: true,
      }).success,
    ).toBe(false)
  })
})

describe('contentGrantSchema — equipment', () => {
  it('parses a fixed equipment grant', () => {
    expect(
      contentGrantSchema.parse({
        kind: 'equipment',
        grant: { kind: 'fixed', equipmentSlug: 'dagger', quantity: 1 },
      }),
    ).toMatchObject({ kind: 'equipment', grant: { kind: 'fixed', equipmentSlug: 'dagger' } })
  })
})

describe('contentGrantSchema — spells', () => {
  it('parses an always_prepared spells grant', () => {
    expect(
      contentGrantSchema.parse({
        kind: 'spells',
        ability: 'wis',
        mode: 'always_prepared',
        spellIds: ['bless', 'cure-wounds'],
      }),
    ).toEqual({
      kind: 'spells',
      ability: 'wis',
      mode: 'always_prepared',
      spellIds: ['bless', 'cure-wounds'],
    })
  })

  it('parses a free_cast spells grant with frequency', () => {
    expect(
      contentGrantSchema.parse({
        kind: 'spells',
        ability: 'cha',
        mode: 'free_cast',
        frequency: 'at_will',
        spellIds: ['dancing-lights'],
      }),
    ).toEqual({
      kind: 'spells',
      ability: 'cha',
      mode: 'free_cast',
      frequency: 'at_will',
      spellIds: ['dancing-lights'],
    })
  })

  it('rejects always_prepared with frequency', () => {
    expect(
      contentGrantSchema.safeParse({
        kind: 'spells',
        ability: 'wis',
        mode: 'always_prepared',
        frequency: 'at_will',
        spellIds: ['bless'],
      }).success,
    ).toBe(false)
  })

  it('rejects empty spellIds', () => {
    expect(
      contentGrantSchema.safeParse({
        kind: 'spells',
        ability: 'wis',
        mode: 'always_prepared',
        spellIds: [],
      }).success,
    ).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// grantGroupsSchema — canonical shape enforcement
// ---------------------------------------------------------------------------

describe('grantGroupsSchema', () => {
  const senseGrant = { kind: 'sense' as const, type: 'darkvision', range: 60 }
  const spellGrant = {
    kind: 'spells' as const,
    ability: 'cha' as const,
    mode: 'free_cast' as const,
    frequency: 'at_will' as const,
    spellIds: ['dancing-lights'],
  }

  it('accepts an empty array', () => {
    expect(grantGroupsSchema.parse([])).toEqual([])
  })

  it('accepts a single default group', () => {
    expect(grantGroupsSchema.parse([{ grants: [senseGrant] }])).toEqual([{ grants: [senseGrant] }])
  })

  it('accepts default group followed by ascending level groups', () => {
    const groups = [
      { grants: [senseGrant] },
      { unlock: { level: 3 }, grants: [spellGrant] },
      { unlock: { level: 5 }, grants: [spellGrant] },
    ]
    expect(grantGroupsSchema.parse(groups)).toEqual(groups)
  })

  it('rejects two default groups', () => {
    expect(
      grantGroupsSchema.safeParse([{ grants: [senseGrant] }, { grants: [spellGrant] }]).success,
    ).toBe(false)
  })

  it('rejects default group not in first position', () => {
    expect(
      grantGroupsSchema.safeParse([
        { unlock: { level: 3 }, grants: [spellGrant] },
        { grants: [senseGrant] },
      ]).success,
    ).toBe(false)
  })

  it('rejects duplicate unlock levels', () => {
    expect(
      grantGroupsSchema.safeParse([
        { unlock: { level: 3 }, grants: [senseGrant] },
        { unlock: { level: 3 }, grants: [spellGrant] },
      ]).success,
    ).toBe(false)
  })

  it('rejects unsorted unlock levels', () => {
    expect(
      grantGroupsSchema.safeParse([
        { unlock: { level: 5 }, grants: [spellGrant] },
        { unlock: { level: 3 }, grants: [senseGrant] },
      ]).success,
    ).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// normalizeGrantGroups
// ---------------------------------------------------------------------------

describe('normalizeGrantGroups', () => {
  const grantA: Parameters<typeof normalizeGrantGroups>[0][number]['grants'][number] = {
    kind: 'sense',
    type: 'darkvision',
    range: 60,
  }
  const grantB: Parameters<typeof normalizeGrantGroups>[0][number]['grants'][number] = {
    kind: 'resistances',
    damageTypes: ['fire'],
  }

  it('returns an empty array unchanged', () => {
    expect(normalizeGrantGroups([])).toEqual([])
  })

  it('strips groups with empty grants arrays', () => {
    expect(normalizeGrantGroups([{ grants: [] }])).toEqual([])
  })

  it('drops unlock when it equals the parent unlock level', () => {
    const result = normalizeGrantGroups([{ unlock: { level: 3 }, grants: [grantA] }], { level: 3 })
    expect(result).toEqual([{ grants: [grantA] }])
  })

  it('keeps unlock when it differs from parent unlock level', () => {
    const result = normalizeGrantGroups([{ unlock: { level: 5 }, grants: [grantA] }], { level: 3 })
    expect(result).toEqual([{ unlock: { level: 5 }, grants: [grantA] }])
  })

  it('merges groups with duplicate unlock levels', () => {
    const result = normalizeGrantGroups([
      { unlock: { level: 3 }, grants: [grantA] },
      { unlock: { level: 3 }, grants: [grantB] },
    ])
    expect(result).toEqual([{ unlock: { level: 3 }, grants: [grantA, grantB] }])
  })

  it('sorts: default group first, then ascending level', () => {
    const result = normalizeGrantGroups([
      { unlock: { level: 5 }, grants: [grantB] },
      { grants: [grantA] },
      { unlock: { level: 3 }, grants: [grantB] },
    ])
    expect(result).toEqual([
      { grants: [grantA] },
      { unlock: { level: 3 }, grants: [grantB] },
      { unlock: { level: 5 }, grants: [grantB] },
    ])
  })
})

// ---------------------------------------------------------------------------
// flattenGrantGroups
// ---------------------------------------------------------------------------

describe('flattenGrantGroups', () => {
  it('flattens groups into { grant, unlock? } pairs', () => {
    const senseGrant = { kind: 'sense' as const, type: 'darkvision', range: 60 }
    const spellGrant = {
      kind: 'spells' as const,
      ability: 'cha' as const,
      mode: 'free_cast' as const,
      frequency: 'at_will' as const,
      spellIds: ['dancing-lights'],
    }

    const result = flattenGrantGroups([
      { grants: [senseGrant] },
      { unlock: { level: 3 }, grants: [spellGrant] },
    ])

    expect(result).toEqual([
      { grant: senseGrant, unlock: undefined },
      { grant: spellGrant, unlock: { level: 3 } },
    ])
  })
})

// ---------------------------------------------------------------------------
// getGrantGroupEffectiveUnlock
// ---------------------------------------------------------------------------

describe('getGrantGroupEffectiveUnlock', () => {
  const senseGrant = { kind: 'sense' as const, type: 'darkvision', range: 60 }

  it('returns the group unlock when present', () => {
    expect(getGrantGroupEffectiveUnlock({ unlock: { level: 5 }, grants: [senseGrant] })).toEqual({
      level: 5,
    })
  })

  it('falls back to parentUnlock for a default group', () => {
    expect(getGrantGroupEffectiveUnlock({ grants: [senseGrant] }, { level: 3 })).toEqual({
      level: 3,
    })
  })

  it('returns undefined for a default group with no parentUnlock', () => {
    expect(getGrantGroupEffectiveUnlock({ grants: [senseGrant] })).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// getUnlockedGrantsAtLevel
// ---------------------------------------------------------------------------

describe('getUnlockedGrantsAtLevel', () => {
  const senseGrant = { kind: 'sense' as const, type: 'darkvision', range: 60 }
  const spellGrant3 = {
    kind: 'spells' as const,
    ability: 'cha' as const,
    mode: 'free_cast' as const,
    frequency: 'once_per_long_rest' as const,
    spellIds: ['faerie-fire'],
  }
  const spellGrant5 = {
    kind: 'spells' as const,
    ability: 'cha' as const,
    mode: 'free_cast' as const,
    frequency: 'once_per_long_rest' as const,
    spellIds: ['darkness'],
  }

  const groups = [
    { grants: [senseGrant] },
    { unlock: { level: 3 }, grants: [spellGrant3] },
    { unlock: { level: 5 }, grants: [spellGrant5] },
  ]

  it('returns default group grants when level >= parentLevel', () => {
    expect(getUnlockedGrantsAtLevel(groups, 1)).toEqual([senseGrant])
  })

  it('returns all grants up to and including the requested level', () => {
    expect(getUnlockedGrantsAtLevel(groups, 3)).toEqual([senseGrant, spellGrant3])
  })

  it('returns all grants when level >= highest unlock', () => {
    expect(getUnlockedGrantsAtLevel(groups, 5)).toEqual([senseGrant, spellGrant3, spellGrant5])
  })

  it('excludes grants from future unlock levels', () => {
    expect(getUnlockedGrantsAtLevel(groups, 4)).toEqual([senseGrant, spellGrant3])
  })

  it('uses parentLevel for default group comparison', () => {
    const result = getUnlockedGrantsAtLevel([{ grants: [senseGrant] }], 3, 5)
    expect(result).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// isGrantGroupsEligible
// ---------------------------------------------------------------------------

describe('isGrantGroupsEligible', () => {
  const senseGrant = { kind: 'sense' as const, type: 'darkvision', range: 60 }
  const spellGrant = {
    kind: 'spells' as const,
    ability: 'cha' as const,
    mode: 'free_cast' as const,
    spellIds: ['dancing-lights'],
  }

  it('accepts a single default group with one sense grant', () => {
    expect(isGrantGroupsEligible([{ grants: [senseGrant] }])).toBe(true)
  })

  it('accepts a single default group with one resistances grant', () => {
    expect(
      isGrantGroupsEligible([{ grants: [{ kind: 'resistances', damageTypes: ['fire'] }] }]),
    ).toBe(true)
  })

  it('accepts a single default group with one movement grant', () => {
    expect(
      isGrantGroupsEligible([
        {
          grants: [{ kind: 'movement', mode: 'walk', operation: 'bonus', value: 5, unit: 'ft' }],
        },
      ]),
    ).toBe(true)
  })

  it('accepts a single default group with one languages grant', () => {
    expect(
      isGrantGroupsEligible([{ grants: [{ kind: 'languages', languageIds: ['elvish'] }] }]),
    ).toBe(true)
  })

  it('rejects when there are multiple groups', () => {
    expect(
      isGrantGroupsEligible([
        { grants: [senseGrant] },
        { unlock: { level: 3 }, grants: [spellGrant] },
      ]),
    ).toBe(false)
  })

  it('rejects a group with an unlock (not default)', () => {
    expect(isGrantGroupsEligible([{ unlock: { level: 3 }, grants: [senseGrant] }])).toBe(false)
  })

  it('rejects a group with multiple grants', () => {
    expect(
      isGrantGroupsEligible([
        { grants: [senseGrant, { kind: 'resistances', damageTypes: ['fire'] }] },
      ]),
    ).toBe(false)
  })

  it('rejects spells-only grant (not eligible kind)', () => {
    expect(isGrantGroupsEligible([{ grants: [spellGrant] }])).toBe(false)
  })
})
