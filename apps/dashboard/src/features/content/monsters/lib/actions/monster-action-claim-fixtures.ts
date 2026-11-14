import { ACTION_PRESET_IDS, monsterSectionAllowsPreset } from '@rpg/contracts'
import {
  collectTabbedFormResolverItems,
  prepareFormIssues,
  safeParseWithFieldErrors,
  type FormIssue,
} from '@rpg/ui/form'
import { collectIssueClaimReport, toRegisteredFormShape } from '@rpg/ui/form/test-utils'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { buildMonsterTabs } from '../monster-form-fields'
import { resolveMonsterFormSchema } from '../monster-form-schema'
import { monsterActionRowResolveFields } from '../monster-master-detail-validation-fields'
import {
  createMonsterActionFromAcquisition,
  type MonsterActionAcquisitionChoice,
} from './monster-action-acquisition'
import type { MonsterActionSection } from './monster-action-equipment-references'

export const monsterClaimCtx = {
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
  bonusActions: [],
  reactions: [],
}

export const monsterClaimFields = collectTabbedFormResolverItems(buildMonsterTabs(monsterClaimCtx))
export const monsterClaimTabs = buildMonsterTabs(monsterClaimCtx)
export const monsterClaimSchema = resolveMonsterFormSchema(monsterClaimCtx, 'publish')

const CREATE_CHOICES: MonsterActionAcquisitionChoice[] = [
  { type: 'create', kind: 'attack' },
  { type: 'create', kind: 'special' },
  { type: 'create', kind: 'save' },
  { type: 'create', kind: 'spell', spellAcquisition: 'primary' },
  { type: 'create', kind: 'spell', spellAcquisition: 'standalone' },
  { type: 'other-natural' },
  ...ACTION_PRESET_IDS.filter((presetId) => monsterSectionAllowsPreset('actions', presetId)).map(
    (presetId) => ({ type: 'preset' as const, presetId }),
  ),
]

export function monsterActionChoices(): MonsterActionAcquisitionChoice[] {
  return CREATE_CHOICES
}

export function monsterActionRowFields(action: unknown, section: MonsterActionSection = 'actions') {
  return monsterActionRowResolveFields({ ctx: monsterClaimCtx, section })(action, 0)
}

export function monsterClaimValues(
  action: unknown,
  shape: 'created' | 'registered',
  section: MonsterActionSection = 'actions',
) {
  const row =
    shape === 'registered'
      ? toRegisteredFormShape(action, monsterActionRowFields(action, section))
      : action
  return { ...publishBody, [section]: [row] }
}

export function monsterClaimReport(
  action: unknown,
  shape: 'created' | 'registered',
  section: MonsterActionSection = 'actions',
) {
  return collectIssueClaimReport({
    schema: monsterClaimSchema,
    values: monsterClaimValues(action, shape, section),
    fields: monsterClaimFields,
  })
}

export function monsterRoutedIssues(
  action: unknown,
  shape: 'created' | 'registered',
  section: MonsterActionSection = 'actions',
): FormIssue[] {
  const values = monsterClaimValues(action, shape, section)
  const parsed = safeParseWithFieldErrors(monsterClaimSchema, values, monsterClaimFields)
  if (parsed.success) return []
  return prepareFormIssues(
    parsed.error.issues,
    monsterClaimFields,
    values as Record<string, unknown>,
  )
}

export function blankSaveAction() {
  return createMonsterActionFromAcquisition({ type: 'create', kind: 'save' })
}
