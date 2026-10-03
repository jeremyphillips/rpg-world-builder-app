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

function armor(slug: string, name: string, category: 'heavy' | 'shields') {
  return equipment({
    slug,
    name,
    kind: 'armor',
    category,
    ...(category === 'shields' ? { acBonus: 2 } : { baseAc: 16 }),
    addDexModifier: false,
    stealthDisadvantage: false,
  })
}

const greatsword = weapon('greatsword', 'Greatsword', 'martial')
const dagger = weapon('dagger', 'Dagger', 'simple')
const axe = weapon('axe', 'Axe', 'martial')
const chainMail = armor('chain-mail', 'Chain Mail', 'heavy')
const shield = armor('shield', 'Shield', 'shields')
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
    equipment: [greatsword, dagger, axe, chainMail, shield, lute],
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
    expect(advisories.map((advisory) => advisory.subject.equipmentClass)).toEqual([
      'armor',
      'shield',
    ])
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
})
