import { describe, expect, it } from 'vitest'
import { collectIssueClaimReport } from '@rpg/ui/form/test-utils'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { createMonsterActionFromAcquisition } from './monster-action-acquisition'
import { monsterActionDetailFields } from './monster-action-detail-fields'
import { resolveMonsterFormSchema } from '../monster-form-schema'

const ctx = {
  equipmentCatalogStatus: 'ready',
  skillCatalogStatus: 'ready',
  spellCatalogStatus: 'ready',
  equipmentCatalogById: new Map(),
  skillCatalogBySlug: new Map(),
  spellCatalogById: new Map(),
} as unknown as ContentFormCtx

const publishBody = {
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
  actions: [] as unknown[],
  bonusActions: [],
  reactions: [],
}

const schema = resolveMonsterFormSchema(ctx, 'publish')

function saveDetailFields(action: ReturnType<typeof createMonsterActionFromAcquisition>) {
  return monsterActionDetailFields({
    ctx,
    action,
    section: 'actions',
    namePrefix: 'actions.0',
    equipmentOptions: [],
    sharedCastingOptions: [],
  })
}

function claimReportForAction(action: unknown, fields: ReturnType<typeof saveDetailFields>) {
  return collectIssueClaimReport({
    schema,
    values: { ...publishBody, actions: [action] },
    fields,
    fieldPathPrefix: 'actions.0',
  })
}

describe('monster save action issue routing', () => {
  it('routes blank save rows to visible fields (not fallback claims)', () => {
    const blankSave = createMonsterActionFromAcquisition({ type: 'create', kind: 'save' })
    const fields = saveDetailFields(blankSave)
    const report = claimReportForAction(blankSave, fields)

    expect(report.length).toBeGreaterThan(0)
    expect(report.filter((entry) => entry.claim.kind === 'fallback')).toEqual([])

    const controllable = report.filter((entry) => !entry.path.includes('resolution.outcomes'))
    expect(
      controllable.every((entry) => entry.claim.kind === 'field' || entry.claim.kind === 'slot'),
    ).toBe(true)

    const byPath = new Map(report.map((entry) => [entry.path, entry]))
    expect(byPath.get('actions.0.resolution.method')?.claim).toMatchObject({
      kind: 'field',
      target: 'actions.0.resolution.method.ability',
    })
    expect(byPath.get('actions.0.resolution.effects')?.claim.kind).toBe('field')
    expect(byPath.get('actions.0.dcSource')?.claim.kind).toBe('field')
  })

  it('routes cleared save values through breath-weapon detail fields without fallback claims', () => {
    const preset = createMonsterActionFromAcquisition({ type: 'preset', presetId: 'breath-weapon' })
    const fields = saveDetailFields(preset)
    const row = createMonsterActionFromAcquisition({ type: 'create', kind: 'save' })

    const report = claimReportForAction(row, fields)
    expect(report.length).toBeGreaterThan(0)
    expect(report.filter((entry) => entry.claim.kind === 'fallback')).toEqual([])

    const nonOutcome = report.filter((entry) => !entry.path.includes('resolution.outcomes'))
    const uncontrollable = nonOutcome.filter(
      (entry) => entry.claim.kind !== 'field' && entry.claim.kind !== 'slot',
    )
    expect(uncontrollable, JSON.stringify(uncontrollable, null, 2)).toEqual([])
  })
})
