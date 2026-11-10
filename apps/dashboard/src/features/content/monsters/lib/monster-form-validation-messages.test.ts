import { formatFieldMessage } from '@rpg/contracts'
import {
  collectTabbedFormResolverItems,
  groupIssuesForItemPrefix,
  makeFieldErrorMap,
} from '@rpg/ui/form'
import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { buildMonsterTabs } from './monster-form-fields'
import { resolveMonsterFormSchema } from './monster-form-schema'
import { normalizeMonsterFormValues } from './normalize-monster-form-values'

const ctx = {
  equipmentCatalogStatus: 'ready',
  skillCatalogStatus: 'ready',
  spellCatalogStatus: 'ready',
  equipmentCatalogById: new Map(),
  skillCatalogBySlug: new Map(),
  spellCatalogById: new Map(),
} as unknown as ContentFormCtx

const schema = resolveMonsterFormSchema(ctx, 'publish')
const errorMap = makeFieldErrorMap(collectTabbedFormResolverItems(buildMonsterTabs(ctx)))

const body = {
  name: 'Test',
  sizes: ['medium'],
  creatureType: 'humanoid',
  alignment: 'n',
  abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  armorClass: {},
  hitPoints: { kind: 'hit-dice', count: 1 },
  movement: [{ mode: 'walk', feet: 30 }],
  senses: [{ type: 'darkvision', range: 60 }],
  communication: {},
  challengeRating: '1',
  proficiencies: { savingThrows: [], skills: [], languages: [], weapons: [] },
  defenses: {
    vulnerabilities: [],
    resistances: [],
    immunities: [],
    conditionImmunities: [],
  },
  equipment: [],
  traits: [],
  actions: [],
  bonusActions: [],
  reactions: [],
}

function publish(actions: unknown[], traits: unknown[] = body.traits) {
  return schema.safeParse({ ...body, actions, traits }, { error: errorMap })
}

function messages(result: ReturnType<typeof publish>) {
  if (result.success) return []
  return result.error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: formatFieldMessage(issue.message),
  }))
}

function messageAt(result: ReturnType<typeof publish>, path: string) {
  return messages(result).find((issue) => issue.path === path)?.message
}

describe('monster publish validation messages', () => {
  it('names the missing control instead of the actions slot', () => {
    const result = publish([
      { id: 'spell', kind: 'spell', spells: [] },
      { id: 'special', kind: 'special', name: '   ', description: '<p></p>' },
      { id: 'attack', kind: 'attack', name: 'Slash' },
      { id: 'weapon', kind: 'weapon', onHit: { additionalDamage: [] } },
      { id: 'multi', kind: 'multiattack', steps: [] },
      { id: 'step', kind: 'multiattack', steps: [{ actionIds: [] }] },
      {
        id: 'save',
        kind: 'save',
        name: 'Breath',
        dcSource: { kind: 'ability', ability: 'con', proficient: false },
        resolution: {
          method: { kind: 'saving-throw', ability: 'dex' },
          effects: [
            {
              id: 'damage',
              kind: 'damage',
              roll: { dice: { count: 1, faces: 6 } },
              damageType: 'fire',
            },
          ],
          outcomes: [{ result: 'failed-save', applications: [] }],
        },
      },
    ])

    expect(messageAt(result, 'actions.0.castingAbility')).toBe('Choose a spellcasting ability.')
    expect(messageAt(result, 'actions.0.spells')).toBe('Add at least one spell.')
    expect(messageAt(result, 'actions.0.name')).toBe('Name is required.')
    expect(messageAt(result, 'actions.1.description')).toBe("Enter the action's rules text.")
    expect(messageAt(result, 'actions.1.name')).toBe('Name is required.')
    expect(messageAt(result, 'actions.2.modes')).toBe('Choose at least one mode.')
    expect(messageAt(result, 'actions.2.bonusSource')).toBe('Choose an attack bonus.')
    expect(messageAt(result, 'actions.2.damage')).toBe('Damage roll is required.')
    expect(messageAt(result, 'actions.2.damageType')).toBe('Choose a type.')
    expect(messageAt(result, 'actions.3.equipmentEntryId')).toBe('Choose a weapon.')
    expect(messages(result).some((issue) => issue.path.startsWith('actions.3.onHit'))).toBe(false)
    expect(messageAt(result, 'actions.4.steps')).toBe('Add at least one step.')
    expect(messageAt(result, 'actions.5.steps.0.count')).toBe('Count is required.')
    expect(messageAt(result, 'actions.5.steps.0.actionIds')).toBe('Choose at least one attack.')
    expect(messageAt(result, 'actions.6.resolution.selectionMode')).toBe(
      'Saving throw actions select an area from self or creatures in reach or at a distance.',
    )
    expect(messages(result).some((issue) => issue.message === 'actions is required.')).toBe(false)
    expect(messages(result).some((issue) => issue.path.endsWith('available'))).toBe(false)

    const attackIssues = messages(result).filter((issue) => issue.path.startsWith('actions.2.'))
    expect(
      groupIssuesForItemPrefix(
        attackIssues.map((issue) => ({
          path: issue.path,
          message: issue.message,
          severity: 'field' as const,
        })),
        'actions.2',
        'actions',
        2,
        [],
      ).totalCount,
    ).toBeGreaterThan(1)
  })

  it('keeps a partial on-hit row and an empty damage override', () => {
    const normalized = normalizeMonsterFormValues(
      {
        ...body,
        actions: [
          {
            id: 'bite',
            kind: 'natural-weapon',
            name: 'Bite',
            mode: 'melee',
            reach: 5,
            damage: { dice: { count: 1, faces: 6 } },
            damageType: 'piercing',
            onHit: {
              additionalDamage: [{}, { damageType: 'fire', roll: { dice: { count: 1 } } }],
            },
          },
          {
            id: 'bow',
            kind: 'weapon',
            equipmentEntryId: 'bow',
            damage: {},
            onHit: { additionalDamage: [] },
          },
        ],
      } as never,
      { intent: 'publish' },
    )
    const actions = normalized.actions as Record<string, unknown>[]
    expect(actions[0]?.onHit).toEqual({
      additionalDamage: [{ damageType: 'fire', roll: { dice: { count: 1 } } }],
    })
    expect(actions[1]?.onHit).toBeUndefined()
    expect(actions[1]?.damage).toEqual({})
  })

  it('publishes an unchecked proficiency and strips empty rules text', () => {
    const attack = publish([
      {
        id: 'atk',
        kind: 'attack',
        name: 'Slash',
        bonusSource: { kind: 'ability', ability: 'str', proficient: false },
        modes: ['melee'],
        reach: 5,
        damage: { dice: { count: 1, faces: 6 } },
        damageType: 'slashing',
      },
    ])
    expect(attack.success, JSON.stringify(messages(attack))).toBe(true)
    if (attack.success) {
      expect(attack.data.actions[0]).toMatchObject({
        bonusSource: { proficient: false },
      })
    }

    const special = publish([
      { id: 'note', kind: 'special', name: 'Note', description: '<p>A real trick.</p>' },
    ])
    expect(special.success).toBe(true)

    const recharge = publish([
      {
        id: 'note',
        kind: 'special',
        name: 'Note',
        description: '<p>A real trick.</p>',
        limitedUse: { kind: 'recharge', minRoll: 1 },
      },
    ])
    expect(messageAt(recharge, 'actions.0.limitedUse.minRoll')).toBe(
      'Recharge roll must be at least 2.',
    )
  })

  it('requires custom trait prose and keeps preset sentences on their own paths', () => {
    const traits = publish(
      [],
      [
        { id: 'custom', kind: 'custom', name: ' ', description: '<p><br></p>' },
        { id: 'light', preset: 'illumination' },
        { id: 'reek', preset: 'stench', dc: 0 },
        { id: 'mimic', preset: 'mimicry' },
        { id: 'air', preset: 'air-form' },
        { id: 'template', kind: 'template', templateId: 'legendary-resistance', config: {} },
      ],
    )
    expect(messageAt(traits, 'traits.0.name')).toBe('Name is required.')
    expect(messageAt(traits, 'traits.0.description')).toBe("Enter the trait's description.")
    expect(messageAt(traits, 'traits.1.radius')).toBe('Bright radius is required.')
    expect(messageAt(traits, 'traits.2.dc')).toBe('Save DC must be at least 1.')
    expect(messageAt(traits, 'traits.2.radius')).toBe('Emanation radius is required.')
    expect(messageAt(traits, 'traits.3.sounds')).toBe('Choose which sounds it can mimic.')
    expect(messageAt(traits, 'traits.4.space')).toBe('Choose a space.')
    expect(messageAt(traits, 'traits.5.config.uses')).toBe('Uses is required.')
    expect(messages(traits).some((issue) => issue.path.endsWith('available'))).toBe(false)
  })

  it('does not require a name for a derived weapon', () => {
    const result = publish([{ id: 'sword', kind: 'weapon', equipmentEntryId: 'sword' }])
    expect(messages(result).some((issue) => issue.path === 'actions.0.name')).toBe(false)
  })
})
