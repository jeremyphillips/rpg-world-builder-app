import { describe, expect, it } from 'vitest'
import type { GrantGroups } from '@rpg/contracts'

import {
  formatDamageTypeRowSummary,
  formatFeatChoiceRowSummary,
  formatGrantRowPrimary,
  formatGrantRowSummary,
  formatLanguageRowSummary,
  formatResistanceRowSummary,
  formatSenseRowSummary,
  formatSpellRowTitle,
  GRANT_TYPE_MISSING_PRIMARY,
  type GrantRowHeaderContext,
} from './grant-form-fields'
import {
  GRANT_ROW_TYPE_LABELS,
  GRANT_ROW_TYPES,
  GRANT_TYPES,
  GRANT_TYPE_LABELS,
  GRANT_DEFAULT_UNLOCK_LEVEL,
} from './grant-form-schema'
import {
  formRowsToGrants,
  formRowsToGrantGroups,
  grantGroupsToFormRows,
  grantsToFormRows,
} from './grant-form-values'

describe('grantsToFormRows / formRowsToGrants (legacy bridge)', () => {
  it('converts innate spell entries to spells rows', () => {
    const rows = grantsToFormRows({
      innateSpells: {
        ability: 'cha' as const,
        entries: [
          {
            level: 1,
            kind: 'free_cast' as const,
            spellIds: ['power-word-heal', 'power-word-kill'],
          },
        ],
      },
    })
    const spellRow = rows.find((row) => row.grantType === 'spells')
    expect(spellRow).toBeDefined()
    expect(spellRow?.spellIds).toEqual(['power-word-heal', 'power-word-kill'])
    expect(spellRow?.spellAbility).toBe('cha')
  })

  it('round-trips recommended feat ids on feat choice grants', () => {
    const grants = {
      featChoice: {
        category: 'fighting-style' as const,
        choose: 1,
        replaceable: true,
        recommendedFeatIds: ['defense'],
      },
    }
    const rows = grantsToFormRows(grants)
    const featRow = rows.find((row) => row.grantType === 'featChoice')

    expect(featRow?.featRecommendedIds).toEqual(['defense'])

    const restored = formRowsToGrants(rows)
    expect(restored?.featChoice).toEqual({
      category: 'fighting-style',
      choose: 1,
      replaceable: true,
      recommendedFeatIds: ['defense'],
    })
  })

  it('round-trips feat choice grants', () => {
    const grants = {
      featChoice: {
        category: 'fighting-style' as const,
        choose: 1,
        replaceable: true,
        recommendedFeatIds: ['defense'],
      },
    }
    const rows = grantsToFormRows(grants)
    const featRow = rows.find((row) => row.grantType === 'featChoice')

    expect(featRow?.featCategory).toBe('fighting-style')
    expect(featRow?.featChoose).toBe(1)
    expect(featRow?.featReplaceable).toBe(true)

    const restored = formRowsToGrants(rows)
    expect(restored?.featChoice).toEqual({
      category: 'fighting-style',
      choose: 1,
      replaceable: true,
      recommendedFeatIds: ['defense'],
    })
  })

  it('round-trips equipment grants when the row type list includes equipment', () => {
    const grants = {
      equipment: [
        { kind: 'fixed' as const, equipmentSlug: 'dagger', quantity: 2, equipped: true },
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

    const rows = grantsToFormRows(grants)
    expect(rows.filter((row) => row.grantType === 'equipment')).toHaveLength(2)
    expect(rows.find((row) => row.itemKind === 'fixed')).toMatchObject({
      grantType: 'equipment',
      equipmentSlug: 'dagger',
      quantity: 2,
      equipped: true,
    })
    expect(rows.find((row) => row.itemKind === 'choice')).toMatchObject({
      grantType: 'equipment',
      poolSource: 'filtered',
      poolEquipmentKind: 'tool',
      poolToolCategory: 'musical_instrument',
    })

    expect(formRowsToGrants(rows)).toEqual(grants)
  })
})

describe('grantGroupsToFormRows / formRowsToGrantGroups (atomic model)', () => {
  it('round-trips a spells grant through grantGroups', () => {
    const groups: GrantGroups = [
      {
        grants: [
          {
            kind: 'spells',
            ability: 'cha',
            mode: 'free_cast',
            frequency: 'once_per_long_rest',
            spellIds: ['power-word-heal', 'power-word-kill'],
          },
        ],
      },
    ]
    const rows = grantGroupsToFormRows(groups)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.grantType).toBe('spells')
    expect(rows[0]?.spellIds).toEqual(['power-word-heal', 'power-word-kill'])
    expect(rows[0]?.spellAbility).toBe('cha')
    expect(rows[0]?.spellMode).toBe('free_cast')
    expect(rows[0]?.spellFrequency).toBe('once_per_long_rest')
    expect(rows[0]?.unlockLevel).toBe(GRANT_DEFAULT_UNLOCK_LEVEL)

    const restored = formRowsToGrantGroups(rows)
    expect(restored).toEqual(groups)
  })

  it('stamps unlockLevel from the group onto rows', () => {
    const groups: GrantGroups = [
      {
        unlock: { level: 5 },
        grants: [
          {
            kind: 'spells',
            ability: 'wis',
            mode: 'always_prepared',
            spellIds: ['bless', 'cure-wounds'],
          },
        ],
      },
    ]
    const rows = grantGroupsToFormRows(groups)
    expect(rows[0]?.unlockLevel).toBe(5)
  })

  it('groups rows by unlockLevel when saving', () => {
    const rows = [
      {
        grantType: 'spells' as const,
        spellAbility: 'cha' as const,
        spellMode: 'free_cast' as const,
        spellIds: ['dancing-lights'],
        unlockLevel: GRANT_DEFAULT_UNLOCK_LEVEL,
      },
      {
        grantType: 'spells' as const,
        spellAbility: 'cha' as const,
        spellMode: 'free_cast' as const,
        spellFrequency: 'once_per_long_rest' as const,
        spellIds: ['faerie-fire'],
        unlockLevel: 3,
      },
    ]
    const groups = formRowsToGrantGroups(rows)
    expect(groups).toHaveLength(2)
    expect(groups[0]?.unlock).toBeUndefined()
    expect(groups[0]?.grants[0]).toMatchObject({ kind: 'spells', spellIds: ['dancing-lights'] })
    expect(groups[1]?.unlock?.level).toBe(3)
    expect(groups[1]?.grants[0]).toMatchObject({ kind: 'spells', spellIds: ['faerie-fire'] })
  })

  it('normalizes unlock level equal to parentUnlock to default group', () => {
    const rows = [
      {
        grantType: 'featChoice' as const,
        featCategory: 'general' as const,
        featChoose: 1,
        featAllowAnyQualifying: true,
        featRecommendedIds: ['ability-score-improvement'],
        unlockLevel: 4,
      },
    ]
    // parentUnlock level = 4 means unlockLevel 4 is the default group
    const groups = formRowsToGrantGroups(rows, { level: 4 })
    expect(groups).toHaveLength(1)
    expect(groups[0]?.unlock).toBeUndefined()
  })

  it('round-trips a tool proficiency grant', () => {
    const groups: GrantGroups = [
      {
        grants: [
          {
            kind: 'toolProficiency',
            grant: {
              kind: 'fixed',
              toolSlugs: ['thieves-tools'],
            },
          },
        ],
      },
    ]
    const rows = grantGroupsToFormRows(groups)
    expect(rows[0]?.grantType).toBe('toolProficiency')
    expect(rows[0]?.proficiencySource).toBe('specific')
    expect(rows[0]?.toolProficiencySlugs).toEqual(['thieves-tools'])

    const restored = formRowsToGrantGroups(rows)
    expect(restored).toEqual(groups)
  })

  it('round-trips a skill proficiency grant', () => {
    const groups: GrantGroups = [
      {
        grants: [
          {
            kind: 'skillProficiency',
            grant: {
              kind: 'fixed',
              skillIds: ['perception'],
            },
          },
        ],
      },
    ]
    const rows = grantGroupsToFormRows(groups)
    expect(rows[0]?.grantType).toBe('skillProficiency')
    expect(rows[0]?.skillProficiencyIds).toEqual(['perception'])

    const restored = formRowsToGrantGroups(rows)
    expect(restored).toEqual(groups)
  })

  it('round-trips a weapon proficiency choice grant', () => {
    const groups: GrantGroups = [
      {
        grants: [
          {
            kind: 'weaponProficiency',
            grant: {
              kind: 'choice',
              choose: 1,
              pool: { source: 'filtered', weaponCategory: 'martial' },
            },
          },
        ],
      },
    ]
    const rows = grantGroupsToFormRows(groups)
    expect(rows[0]?.grantType).toBe('weaponProficiency')
    expect(rows[0]?.proficiencySource).toBe('pool')
    expect(rows[0]?.weaponProficiencyPoolCategory).toBe('martial')

    const restored = formRowsToGrantGroups(rows)
    expect(restored).toEqual(groups)
  })

  it('round-trips an armor training grant', () => {
    const groups: GrantGroups = [
      {
        grants: [
          {
            kind: 'armorTraining',
            grant: {
              kind: 'fixed',
              armorCategories: ['light'],
            },
          },
        ],
      },
    ]
    const rows = grantGroupsToFormRows(groups)
    expect(rows[0]?.grantType).toBe('armorTraining')
    expect(rows[0]?.proficiencySource).toBe('category')
    expect(rows[0]?.armorTrainingCategories).toEqual(['light'])

    const restored = formRowsToGrantGroups(rows)
    expect(restored).toEqual(groups)
  })

  it('expands languages grant with multiple ids into multiple rows', () => {
    const groups: GrantGroups = [
      {
        grants: [{ kind: 'languages', languageIds: ['common', 'elvish'] }],
      },
    ]
    const rows = grantGroupsToFormRows(groups)
    expect(rows.filter((r) => r.grantType === 'languages')).toHaveLength(2)

    const restored = formRowsToGrantGroups(rows)
    // Two separate languages grants, each with 1 ID
    const langGrants = restored[0]?.grants.filter((g) => g.kind === 'languages')
    expect(langGrants).toHaveLength(2)
  })
})

describe('grant row type exports', () => {
  it('keeps consumer grant pickers unchanged while allowing equipment rows in the schema', () => {
    expect(GRANT_ROW_TYPES).toContain('equipment')
    expect(GRANT_ROW_TYPE_LABELS.equipment).toBe('Equipment')
  })

  it('spells replaces innateSpells in the grant types', () => {
    expect(GRANT_ROW_TYPES).toContain('spells')
    expect(GRANT_ROW_TYPES).not.toContain('innateSpells')
    expect(GRANT_ROW_TYPE_LABELS.spells).toBe('Spells')
  })

  it('exposes four atomic proficiency grant types instead of combined proficiencies', () => {
    expect(GRANT_TYPES).toContain('weaponProficiency')
    expect(GRANT_TYPES).toContain('toolProficiency')
    expect(GRANT_TYPES).toContain('skillProficiency')
    expect(GRANT_TYPES).toContain('armorTraining')
    expect(GRANT_TYPES).not.toContain('proficiencies')
    expect(GRANT_TYPE_LABELS.weaponProficiency).toBe('Weapon proficiency')
    expect(GRANT_TYPE_LABELS.armorTraining).toBe('Armor training')
  })
})

describe('formatSpellRowTitle', () => {
  it('shows spell labels when one or two spells are selected', () => {
    expect(
      formatSpellRowTitle(
        ['power-word-heal', 'power-word-kill'],
        [
          { value: 'power-word-heal', label: 'Power Word Heal' },
          { value: 'power-word-kill', label: 'Power Word Kill' },
        ],
      ),
    ).toBe('Power Word Heal, Power Word Kill')
  })

  it('shows a count when more than two spells are selected', () => {
    expect(formatSpellRowTitle(['a', 'b', 'c'], [])).toBe('3 spells')
  })

  it('returns Spells when no spells are selected', () => {
    expect(formatSpellRowTitle([], [])).toBe('Spells')
    expect(formatSpellRowTitle(undefined, [])).toBe('Spells')
  })
})

describe('grant row summaries', () => {
  it('formats damage, sense, language, and feat rows with shared sentence helpers', () => {
    expect(formatResistanceRowSummary(['poison'])).toBe(
      'Character gains Resistance to poison damage.',
    )
    expect(formatDamageTypeRowSummary(['fire', 'cold'])).toBe(
      'Character chooses from fire damage and cold damage.',
    )
    expect(formatSenseRowSummary('darkvision', 60)).toBe(
      'Character gains Darkvision with a range of 60 feet.',
    )
    expect(formatLanguageRowSummary('common')).toBe('Character knows Common.')
    expect(formatFeatChoiceRowSummary('general', 2)).toBe('Character chooses 2 general feats.')
  })
})

const grantRowHeaderContext = {
  rowLabels: GRANT_ROW_TYPE_LABELS,
  equipmentOptions: [],
  weaponOptions: [],
  toolOptions: [],
  armorOptions: [],
  skillOptions: [],
  spellOptions: [
    { value: 'power-word-heal', label: 'Power Word Heal' },
    { value: 'power-word-kill', label: 'Power Word Kill' },
  ],
} satisfies GrantRowHeaderContext

describe('formatGrantRowSummary', () => {
  it('dispatches grant types to the matching row summary formatter', () => {
    expect(
      formatGrantRowSummary(
        { grantType: 'resistances', resistances: ['poison'] },
        grantRowHeaderContext,
      ),
    ).toBe('Character gains Resistance to poison damage.')
    expect(
      formatGrantRowSummary(
        { grantType: 'featChoice', featCategory: 'general', featChoose: 2 },
        grantRowHeaderContext,
      ),
    ).toBe('Character chooses 2 general feats.')
    expect(formatGrantRowSummary({ grantType: 'spells' }, grantRowHeaderContext)).toBe('')
    expect(formatGrantRowSummary({}, grantRowHeaderContext)).toBe('')
  })
})

describe('formatGrantRowPrimary', () => {
  it('dispatches grant types to the matching row title formatter', () => {
    expect(
      formatGrantRowPrimary(
        {
          grantType: 'spells',
          spellIds: ['power-word-heal', 'power-word-kill'],
        },
        0,
        grantRowHeaderContext,
      ),
    ).toBe('Power Word Heal, Power Word Kill')
    expect(formatGrantRowPrimary({ grantType: 'movement' }, 0, grantRowHeaderContext)).toBe(
      'Movement bonus',
    )
    expect(formatGrantRowPrimary({ grantType: 'languages' }, 0, grantRowHeaderContext)).toBe(
      'Language',
    )
  })

  it('shows a repair label when grantType is missing', () => {
    expect(formatGrantRowPrimary({}, 0, grantRowHeaderContext)).toBe(GRANT_TYPE_MISSING_PRIMARY)
    expect(formatGrantRowPrimary({ grantType: '' }, 0, grantRowHeaderContext)).toBe(
      GRANT_TYPE_MISSING_PRIMARY,
    )
  })
})
