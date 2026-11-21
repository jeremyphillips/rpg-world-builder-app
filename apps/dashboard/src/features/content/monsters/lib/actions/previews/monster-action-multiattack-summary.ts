import {
  formatMonsterMultiattackResult,
  isMultiattackAttackGroup,
  isMultiattackUseClause,
  multiattackPositiveInt,
  type CreatureEquipmentCatalog,
  type EquipmentInstance,
  type MagicPropertyDefinitionProvider,
  type Monster,
  type MonsterAction,
  type MonsterActionDraft,
  type MonsterBonusAction,
  type MonsterReferencedSpell,
} from '@rpg/contracts'

type MultiattackActionShape = Extract<MonsterAction, { kind: 'multiattack' }>

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import {
  formatMonsterActionMultiattackPreviewConfigureHint,
  MONSTER_EQUIPMENT_CATALOG_ERROR,
  MONSTER_LOADING_EQUIPMENT,
  MONSTER_MULTIATTACK_REPLACEMENT_LABEL,
  MONSTER_MULTIATTACK_STEPS_LABEL,
} from '../../monster-form-labels'
import type { MonsterFormValues } from '../../monster-form-values'
import { normalizeMonsterDraftForPreview } from '../../normalize-monster-form-values'
import { findMonsterFormActionDraft } from './monster-action-draft-lookup'
import {
  monsterArmorClassRules,
  monsterEquipmentCatalog,
  monsterMagicPropertyProvider,
} from '../../monster-form-derivation'

function isMultiattackDraft(
  action: MonsterActionDraft,
): action is Extract<MonsterActionDraft, { kind: 'multiattack' }> {
  return action.kind === 'multiattack'
}

function multiattackStepsReady(
  action: Extract<MonsterActionDraft, { kind: 'multiattack' }>,
): boolean {
  return (action.steps ?? []).some((step) => {
    if (isMultiattackAttackGroup(step)) {
      return (
        multiattackPositiveInt(step.count) !== undefined &&
        Array.isArray(step.actionIds) &&
        step.actionIds.length > 0
      )
    }
    if (!isMultiattackUseClause(step)) return false
    if (step.mode === 'choice') {
      return (step.choices ?? []).some((choice) => Boolean(choice.actionId))
    }
    return Boolean(step.actionId)
  })
}

function multiattackReplacementBlocksReady(
  action: Extract<MonsterActionDraft, { kind: 'multiattack' }>,
): boolean {
  const replacement = action.replacement
  if (!replacement) return true
  if (!multiattackPositiveInt(replacement.count)) return false
  const choices = replacement.choices ?? []
  return choices.some(
    (choice) => typeof choice.actionId === 'string' && choice.actionId.trim().length > 0,
  )
}

function normalizedMultiattackDraft(
  normalized: Monster,
  actionId: string,
): Extract<MonsterActionDraft, { kind: 'multiattack' }> | undefined {
  const match = (normalized.actions ?? []).find(
    (row) => row?.id === actionId && row.kind === 'multiattack',
  )
  if (!match || match.kind !== 'multiattack') return undefined
  return match as Extract<MonsterActionDraft, { kind: 'multiattack' }>
}

export type MonsterActionMultiattackPreviewUnavailableContext = {
  ctx: ContentFormCtx
  values: MonsterFormValues
  action: Extract<MonsterActionDraft, { kind: 'multiattack' }>
}

export function resolveMonsterActionMultiattackPreviewGuidance({
  ctx,
  action,
}: MonsterActionMultiattackPreviewUnavailableContext): string {
  const configure = formatMonsterActionMultiattackPreviewConfigureHint
  if (ctx.equipmentCatalogStatus === 'error') return MONSTER_EQUIPMENT_CATALOG_ERROR
  if (ctx.equipmentCatalogStatus !== 'ready') return MONSTER_LOADING_EQUIPMENT
  if (!multiattackStepsReady(action)) return configure(MONSTER_MULTIATTACK_STEPS_LABEL)
  if (!multiattackReplacementBlocksReady(action)) {
    return configure(MONSTER_MULTIATTACK_REPLACEMENT_LABEL)
  }
  return configure(MONSTER_MULTIATTACK_STEPS_LABEL)
}

function unavailableMultiattackPreview(
  guidanceContext: MonsterActionMultiattackPreviewUnavailableContext,
): MonsterActionMultiattackPreview {
  return {
    status: 'unavailable',
    guidance: resolveMonsterActionMultiattackPreviewGuidance(guidanceContext),
  }
}

/** Shared `formatMonsterMultiattack` wiring for form preview and monster detail. */
export function buildMonsterMultiattackSentence(input: {
  monsterName: string
  action: MultiattackActionShape
  actions: readonly MonsterAction[]
  bonusActions?: readonly MonsterBonusAction[]
  equipment: readonly EquipmentInstance[]
  equipmentCatalog: CreatureEquipmentCatalog
  magicPropertyProvider: MagicPropertyDefinitionProvider
  spellsById?: ReadonlyMap<string, MonsterReferencedSpell>
  spellCatalogStatus?: 'ready' | 'unavailable'
}): string {
  const result = formatMonsterMultiattackResult({
    monsterName: input.monsterName,
    action: input.action,
    actions: input.actions,
    bonusActions: input.bonusActions,
    equipment: input.equipment,
    equipmentCatalog: input.equipmentCatalog,
    magicPropertyProvider: input.magicPropertyProvider,
    spellsById: input.spellsById,
    spellCatalogStatus: input.spellCatalogStatus,
  })
  return result.status === 'ready' ? result.sentence : ''
}

function renderMultiattackProse(
  values: MonsterFormValues,
  ctx: ContentFormCtx,
  actionId: string,
): string {
  const armorClassRules = monsterArmorClassRules(ctx)
  const normalized = normalizeMonsterDraftForPreview(values, {
    intent: 'draft',
    mode: 'create',
    armorClassRules,
  })
  const multiattack = normalizedMultiattackDraft(normalized, actionId)
  if (!multiattack) return ''
  return buildMonsterMultiattackSentence({
    monsterName: normalized.name?.trim() || 'Creature',
    action: multiattack as MultiattackActionShape,
    actions: normalized.actions ?? [],
    bonusActions: normalized.bonusActions ?? [],
    equipment: normalized.equipment ?? [],
    equipmentCatalog: monsterEquipmentCatalog(ctx),
    magicPropertyProvider: monsterMagicPropertyProvider(ctx),
    spellsById: ctx.spellCatalogById,
    spellCatalogStatus: ctx.spellCatalogStatus === 'ready' ? 'ready' : 'unavailable',
  })
}

export type MonsterActionMultiattackPreview =
  | { status: 'unavailable'; guidance: string }
  | { status: 'ready'; prose: string }

export function buildMonsterActionMultiattackPreview(input: {
  values: MonsterFormValues
  ctx: ContentFormCtx
  actionId: string
  unavailableContext?: MonsterActionMultiattackPreviewUnavailableContext
}): MonsterActionMultiattackPreview | null {
  const draft = findMonsterFormActionDraft(input.values, input.ctx, input.actionId)
  if (!draft || !isMultiattackDraft(draft)) return null

  const guidanceContext = input.unavailableContext ?? {
    ctx: input.ctx,
    values: input.values,
    action: draft,
  }

  if (
    !multiattackStepsReady(draft) ||
    !multiattackReplacementBlocksReady(draft) ||
    input.ctx.equipmentCatalogStatus !== 'ready' ||
    !monsterArmorClassRules(input.ctx)
  ) {
    return unavailableMultiattackPreview(guidanceContext)
  }

  const prose = renderMultiattackProse(input.values, input.ctx, input.actionId).trim()
  if (!prose) return unavailableMultiattackPreview(guidanceContext)

  return { status: 'ready', prose }
}
