import { describe, expect, it } from 'vitest'
import { collectIssueClaimReport } from '@rpg/ui/form/test-utils'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  createMonsterActionFromAcquisition,
  type MonsterActionAcquisitionChoice,
} from './monster-action-acquisition'
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

function claimReport(action: unknown, section: MonsterActionSection = 'actions') {
  return collectIssueClaimReport({
    schema,
    values: { ...publishBody, [section]: [action] },
    fields: [
      {
        kind: 'array' as const,
        name: section,
        label: section,
        fields: [],
        item: { resolveFields: monsterActionRowResolveFields({ ctx, section }) },
      },
    ],
  })
}

const CREATE_ACQUISITION_CHOICES: MonsterActionAcquisitionChoice[] = [
  { type: 'create', kind: 'attack' },
  { type: 'create', kind: 'special' },
  { type: 'create', kind: 'save' },
  { type: 'create', kind: 'spell', spellAcquisition: 'primary' },
  { type: 'create', kind: 'spell', spellAcquisition: 'standalone' },
]

describe('monster action generative claim coverage', () => {
  it('has no fallback claims for every create acquisition choice on publish', () => {
    for (const choice of CREATE_ACQUISITION_CHOICES) {
      const row = createMonsterActionFromAcquisition(choice)
      const report = claimReport(row)
      if (report.length === 0) continue
      const fallbacks = report.filter((entry) => entry.claim.kind === 'fallback')
      expect(fallbacks, `fallbacks for ${JSON.stringify(choice)}`).toEqual([])
    }
  })
})
