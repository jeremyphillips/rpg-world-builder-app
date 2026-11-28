import { ACTION_PRESET_IDS, monsterSectionAllowsPreset } from '@rpg/contracts'
import { collectTabbedFormResolverItems, type FormIssue } from '@rpg/ui/form'
import { collectIssueClaimReport, toRegisteredFormShape } from '@rpg/ui/form/test-utils'
import type { FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { evaluateContentPublishFormIssues } from '../../../../lib/forms/validation/content-publish-validation.lib'
import { buildMonsterTabs } from '../../monster-form-fields'
import { resolveMonsterFormSchema } from '../../monster-form-schema'
import { monsterActionRowResolveFields } from '../../monster-master-detail-validation-fields'
import { createMonsterActionFromAcquisition } from '../acquisition/monster-action-acquisition'
import type { MonsterActionSection } from '../references/monster-action-equipment-references'

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
export const monsterClaimSchema: ZodType = resolveMonsterFormSchema(monsterClaimCtx, 'publish')

/** Choices that create a row; excludes menu-only choices such as add-weapon. */
type CreatableMonsterActionChoice = Parameters<typeof createMonsterActionFromAcquisition>[0]

const CREATE_CHOICES: CreatableMonsterActionChoice[] = [
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

export function monsterActionChoices(): CreatableMonsterActionChoice[] {
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
      ? toRegisteredFormShape(action, [...monsterActionRowFields(action, section)])
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
  return (
    evaluateContentPublishFormIssues(
      monsterClaimSchema as ZodType<FieldValues>,
      values,
      monsterClaimFields,
    ) ?? []
  )
}

export function blankSaveAction() {
  return createMonsterActionFromAcquisition({ type: 'create', kind: 'save' })
}
