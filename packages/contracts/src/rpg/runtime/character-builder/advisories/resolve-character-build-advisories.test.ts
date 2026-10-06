import { describe, expect, expectTypeOf, it } from 'vitest'

import { equipmentSchema, type Equipment } from '../../../content/equipment'
import type { ClassStored } from '../../../content/classes/class'
import {
  type CHARACTER_BUILD_ADVISORY_CODE_ORDER,
  type CharacterBuildAdvisoryCode,
} from '../../../character-builder/build-advisory'
import { EMPTY_CHARACTER_EQUIPMENT } from '../../character/sheet/equipment-inventory'
import { indexCharacterBuildCatalog } from '../context'
import { createEmptyCharacterBuilderDraft, type CharacterBuilderDraft } from '../draft/draft'
import { builderTestCatalog, createCharacterBuildContext, storedFighter } from '../test-fixtures'
import { luteTool } from '../proficiency-test-fixtures'
import { resolveCharacterBuildLoadout } from '../assembly/resolve-character-build-loadout'
import { reconcileEquipmentForClassChange } from '../draft/apply-selected-class-change'
import { deriveEquipmentDraftEntries } from '../resolvers/equipment/derive-equipment-draft-entries'
import {
  resolveCharacterBuildAdvisories,
  resolveCharacterBuildAdvisoriesForDraft,
} from './resolve-character-build-advisories'
import { resolveCharacterBuildAdvisoryMessage } from '../messages/character-builder-advisory-messages'

const RULESET = 'srd-cc-5.2.1' as const

function equipment(fields: Record<string, unknown>): Equipment {
  const slug = fields.slug as string
  return equipmentSchema.parse({
    id: `${RULESET}:${slug}`,
    rulesetId: RULESET,
    source: 'system',
    status: 'published',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    description: '',
    cost: { amount: 1, currency: 'gp' },
    weight: { value: 1, unit: 'lb' },
    ...fields,
  })
}

function weapon(slug: string, name: string, category: 'simple' | 'martial') {
  return equipment({
    slug,
    name,
    kind: 'weapon',
    category,
    mode: 'melee',
    damage: { dice: { count: 1, faces: 8 } },
    damageType: 'slashing',
    properties: [],
    mastery: 'sap',
  })
}

function armor(
  slug: string,
  name: string,
  category: 'heavy' | 'shields',
  extra: Record<string, unknown> = {},
) {
  return equipment({
    slug,
    name,
    kind: 'armor',
    category,
    ...(category === 'shields' ? { acBonus: 2 } : { baseAc: 16 }),
    addDexModifier: false,
    stealthDisadvantage: false,
    ...extra,
  })
}

const greatsword = weapon('greatsword', 'Greatsword', 'martial')
const dagger = weapon('dagger', 'Dagger', 'simple')
const axe = weapon('axe', 'Axe', 'martial')
const chainMail = armor('chain-mail', 'Chain Mail', 'heavy')
const shield = armor('shield', 'Shield', 'shields')
const plateArmor = armor('plate-armor', 'Plate Armor', 'heavy', {
  abilityScoreRequirements: { str: 15 },
})
const lute = luteTool

const scholar: ClassStored = {
  ...storedFighter,
  id: `${RULESET}:scholar`,
  slug: 'scholar',
  name: 'Scholar',
  proficiencies: {
    ...storedFighter.proficiencies,
    armor: { categories: [], items: [] },
    weapons: { categories: ['simple'], items: [] },
  },
}

const context = createCharacterBuildContext({
  catalog: {
    ...builderTestCatalog,
    classes: [storedFighter, scholar],
    equipment: [greatsword, dagger, axe, chainMail, shield, plateArmor, lute],
  },
})
const catalogIndex = indexCharacterBuildCatalog(context.catalog)

function draftWith(classId: string | undefined, grantIds: string[]): CharacterBuilderDraft {
  return {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId, level: 1 },
    equipment: {
      mode: 'package',
      purchases: [],
      editedSincePackageSelection: false,
      grants: grantIds.map((equipmentId) => ({ equipmentId, quantity: 1 })),
    },
  }
}

function advisoryIds(draft: CharacterBuilderDraft) {
  return resolveCharacterBuildAdvisoriesForDraft(draft, context).map(
    (advisory) => advisory.subject.equipmentId,
  )
}

describe('resolveCharacterBuildAdvisoriesForDraft', () => {
  it('returns nothing for proficient weapons', () => {
    expect(advisoryIds(draftWith(scholar.id, [dagger.id]))).toEqual([])
  })

  it('flags a non-proficient weapon', () => {
    expect(
      resolveCharacterBuildAdvisoriesForDraft(draftWith(scholar.id, [greatsword.id]), context),
    ).toEqual([
      {
        code: 'equipment_not_proficient',
        subject: {
          kind: 'equipment',
          equipmentId: greatsword.id,
          label: 'Greatsword',
          equipmentClass: 'weapon',
        },
      },
    ])
  })

  it('flags non-proficient armor and shields with their equipment class', () => {
    const advisories = resolveCharacterBuildAdvisoriesForDraft(
      draftWith(scholar.id, [chainMail.id, shield.id]),
      context,
    )
    expect(
      advisories.flatMap((advisory) =>
        advisory.code === 'equipment_not_proficient' ? [advisory.subject.equipmentClass] : [],
      ),
    ).toEqual(['armor', 'shield'])
  })

  it('ignores tools', () => {
    expect(advisoryIds(draftWith(scholar.id, [lute.id]))).toEqual([])
  })

  it('tracks class changes for retained equipment', () => {
    expect(advisoryIds(draftWith(scholar.id, [greatsword.id]))).toEqual([greatsword.id])
    expect(advisoryIds(draftWith(storedFighter.id, [greatsword.id]))).toEqual([])
  })

  it('orders advisories by label', () => {
    expect(advisoryIds(draftWith(scholar.id, [greatsword.id, axe.id]))).toEqual([
      axe.id,
      greatsword.id,
    ])
  })

  it('returns [] when the loadout cannot resolve a class', () => {
    expect(advisoryIds(draftWith(undefined, [greatsword.id]))).toEqual([])
    expect(advisoryIds(draftWith(`${RULESET}:missing`, [greatsword.id]))).toEqual([])
  })

  it('flags an unresolved explicit purchase without adding it to resolved inventory', () => {
    const draft: CharacterBuilderDraft = {
      ...draftWith(scholar.id, []),
      equipment: {
        mode: 'package',
        purchases: [
          {
            equipmentId: greatsword.id,
            quantity: 1,
            sourceMode: 'startingGold',
            origin: 'picker',
          },
        ],
        editedSincePackageSelection: false,
        grants: [],
        classPackage: { state: 'unresolved' },
      },
    }

    expect(advisoryIds(draft)).toEqual([greatsword.id])
    expect(
      deriveEquipmentDraftEntries(draft, catalogIndex).weapons.map((entry) => entry.equipmentId),
    ).not.toContain(greatsword.id)
  })

  it('dedupes a resolved grant and a pending purchase of the same weapon', () => {
    const draft = draftWith(scholar.id, [greatsword.id])
    draft.equipment = {
      ...draft.equipment!,
      purchases: [
        {
          equipmentId: greatsword.id,
          quantity: 1,
          sourceMode: 'startingGold',
          origin: 'picker',
        },
      ],
      classPackage: { state: 'unresolved' },
    }

    expect(advisoryIds(draft)).toEqual([greatsword.id])
  })

  it('keeps a purchase across a class change and flags the new class', () => {
    const retained = reconcileEquipmentForClassChange({
      equipment: {
        mode: 'package',
        purchases: [
          {
            equipmentId: greatsword.id,
            quantity: 1,
            sourceMode: 'startingGold',
            origin: 'picker',
          },
        ],
        editedSincePackageSelection: false,
        grants: [{ equipmentId: greatsword.id, quantity: 1 }],
        classPackage: { state: 'unresolved' },
      },
      previous: { classId: storedFighter.id, level: 1 },
      next: { classId: scholar.id, level: 1 },
      context,
    })

    const draft: CharacterBuilderDraft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: scholar.id, level: 1 },
      equipment: retained,
    }

    expect(retained?.purchases.map((purchase) => purchase.equipmentId)).toEqual([greatsword.id])
    expect(advisoryIds(draft)).toEqual([greatsword.id])
    expect(advisoryIds({ ...draft, class: { classId: storedFighter.id, level: 1 } })).toEqual([])
  })
})

describe('equipment ability-score requirement advisories', () => {
  function scoredDraft(
    classId: string,
    str: number | undefined,
    equipment: Partial<NonNullable<CharacterBuilderDraft['equipment']>>,
  ): CharacterBuilderDraft {
    const base = draftWith(classId, [])
    return {
      ...base,
      abilities: {
        ...base.abilities,
        scores: str === undefined ? { dex: 10 } : { str, dex: 10 },
      },
      equipment: { ...base.equipment!, ...equipment },
    }
  }

  function requirementAdvisories(draft: CharacterBuilderDraft) {
    return resolveCharacterBuildAdvisoriesForDraft(draft, context).filter(
      (advisory) => advisory.code === 'equipment_ability_score_requirement_unmet',
    )
  }

  it('flags package-owned armor the character is too weak for', () => {
    expect(
      requirementAdvisories(
        scoredDraft(storedFighter.id, 12, {
          grants: [{ equipmentId: plateArmor.id, quantity: 1 }],
        }),
      ),
    ).toEqual([
      {
        code: 'equipment_ability_score_requirement_unmet',
        subject: {
          kind: 'equipment',
          equipmentId: plateArmor.id,
          label: 'Plate Armor',
          unmet: [{ ability: 'str', required: 15, actual: 12 }],
        },
      },
    ])
  })

  it('flags manually purchased armor', () => {
    const draft = scoredDraft(storedFighter.id, 8, {
      purchases: [
        { equipmentId: plateArmor.id, quantity: 1, sourceMode: 'startingGold', origin: 'picker' },
      ],
      classPackage: { state: 'unresolved' },
    })

    expect(requirementAdvisories(draft).map((advisory) => advisory.subject.equipmentId)).toEqual([
      plateArmor.id,
    ])
  })

  it('emits nothing for compatible armor or armor without requirements', () => {
    expect(
      requirementAdvisories(
        scoredDraft(storedFighter.id, 15, {
          grants: [{ equipmentId: plateArmor.id, quantity: 1 }],
        }),
      ),
    ).toEqual([])
    expect(
      requirementAdvisories(
        scoredDraft(storedFighter.id, 8, { grants: [{ equipmentId: chainMail.id, quantity: 1 }] }),
      ),
    ).toEqual([])
  })

  it('emits one advisory for quantity 2', () => {
    expect(
      requirementAdvisories(
        scoredDraft(storedFighter.id, 8, { grants: [{ equipmentId: plateArmor.id, quantity: 2 }] }),
      ),
    ).toHaveLength(1)
  })

  it('clears after raising STR and skips unknown scores', () => {
    const grants = [{ equipmentId: plateArmor.id, quantity: 1 }]
    expect(requirementAdvisories(scoredDraft(storedFighter.id, 14, { grants }))).toHaveLength(1)
    expect(requirementAdvisories(scoredDraft(storedFighter.id, 16, { grants }))).toEqual([])
    expect(requirementAdvisories(scoredDraft(storedFighter.id, undefined, { grants }))).toEqual([])
  })

  it('orders after proficiency advisories for the same item', () => {
    const codes = resolveCharacterBuildAdvisoriesForDraft(
      scoredDraft(scholar.id, 8, { grants: [{ equipmentId: plateArmor.id, quantity: 1 }] }),
      context,
    ).map((advisory) => advisory.code)

    expect(codes).toEqual(['equipment_not_proficient', 'equipment_ability_score_requirement_unmet'])
  })
})

describe('resolveCharacterBuildAdvisories', () => {
  const loadout = resolveCharacterBuildLoadout(draftWith(scholar.id, []), context, [])
  if (!loadout.ok) throw new Error('expected loadout')
  const { proficiencies, effectiveDraft } = loadout.loadout

  it('dedupes package and manual copies of the same item', () => {
    const advisories = resolveCharacterBuildAdvisories({
      effectiveDraft,
      proficiencies,
      catalogIndex,
      equipment: {
        ...EMPTY_CHARACTER_EQUIPMENT,
        weapons: [
          {
            equipmentId: greatsword.id,
            quantity: 1,
            sources: [{ kind: 'classStartingEquipment', sourceId: scholar.id, grantId: 'kit' }],
          },
          { equipmentId: greatsword.id, quantity: 1, sources: [{ kind: 'manual' }] },
        ],
      },
    })
    expect(advisories).toHaveLength(1)
  })

  it('evaluates nothing when the item is not owned', () => {
    expect(
      resolveCharacterBuildAdvisories({
        effectiveDraft,
        proficiencies,
        catalogIndex,
        equipment: EMPTY_CHARACTER_EQUIPMENT,
      }),
    ).toEqual([])
  })
})

describe('advisory code order', () => {
  it('covers every advisory code', () => {
    expectTypeOf<
      Exclude<CharacterBuildAdvisoryCode, (typeof CHARACTER_BUILD_ADVISORY_CODE_ORDER)[number]>
    >().toBeNever()
  })
})

describe('resolveCharacterBuildAdvisoryMessage', () => {
  it.each([
    ['weapon', 'Not proficient with this weapon'],
    ['armor', 'Not proficient with this armor'],
    ['shield', 'Not proficient with this shield'],
  ] as const)('formats %s', (equipmentClass, message) => {
    expect(
      resolveCharacterBuildAdvisoryMessage({
        code: 'equipment_not_proficient',
        subject: { kind: 'equipment', equipmentId: 'x', label: 'X', equipmentClass },
      }),
    ).toBe(message)
  })

  it('formats unmet ability-score requirements as the detail sentence', () => {
    expect(
      resolveCharacterBuildAdvisoryMessage({
        code: 'equipment_ability_score_requirement_unmet',
        subject: {
          kind: 'equipment',
          equipmentId: 'x',
          label: 'Plate Armor',
          unmet: [{ ability: 'str', required: 15, actual: 12 }],
        },
      }),
    ).toBe('Requires STR 15; character has STR 12.')
  })
})
