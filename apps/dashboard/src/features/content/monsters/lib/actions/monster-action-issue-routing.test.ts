import { describe, expect, it } from 'vitest'
import { collectIssueClaimReport } from '@rpg/ui/form/test-utils'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { createMonsterActionFromAcquisition } from './monster-action-acquisition'
import { monsterActionRowResolveFields } from '../monster-master-detail-validation-fields'
import { resolveMonsterFormSchema } from '../monster-form-schema'
import type { MonsterActionSection } from './monster-action-equipment-references'

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

function resolverFieldsForSection(section: MonsterActionSection) {
  return [
    {
      kind: 'array' as const,
      name: section,
      label: section,
      fields: [],
      item: {
        resolveFields: monsterActionRowResolveFields({ ctx, section }),
      },
    },
  ]
}

function claimReportForAction(action: unknown, section: MonsterActionSection = 'actions') {
  return collectIssueClaimReport({
    schema,
    values: { ...publishBody, [section]: [action] },
    fields: resolverFieldsForSection(section),
  })
}

describe('monster save action issue routing', () => {
  it('routes blank save rows to visible fields (not fallback claims)', () => {
    const blankSave = createMonsterActionFromAcquisition({ type: 'create', kind: 'save' })
    const report = claimReportForAction(blankSave)

    expect(report.length).toBeGreaterThan(0)
    expect(report.filter((entry) => entry.claim.kind === 'fallback')).toEqual([])

    expect(
      report.every((entry) => entry.claim.kind === 'field' || entry.claim.kind === 'slot'),
    ).toBe(true)

    expect(report.some((entry) => entry.path.includes('resolution.method.ability'))).toBe(true)
    expect(report.some((entry) => entry.path.includes('resolution.effects'))).toBe(true)
  })

  it('routes cleared save values through save detail fields without fallback claims', () => {
    const row = createMonsterActionFromAcquisition({ type: 'create', kind: 'save' })
    const report = claimReportForAction(row)
    expect(report.length).toBeGreaterThan(0)
    expect(report.filter((entry) => entry.claim.kind === 'fallback')).toEqual([])

    const uncontrollable = report.filter(
      (entry) => entry.claim.kind !== 'field' && entry.claim.kind !== 'slot',
    )
    expect(uncontrollable, JSON.stringify(uncontrollable, null, 2)).toEqual([])
  })
})
