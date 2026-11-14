import {
  formatMonsterMultiattack,
  type CreatureEquipmentCatalog,
  type EquipmentInstance,
  type MagicPropertyDefinitionProvider,
  type MonsterAction,
  type MonsterActionDraft,
} from '@rpg/contracts'

type MultiattackActionShape = Extract<MonsterAction, { kind: 'multiattack' }>

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  formatMonsterActionMultiattackPreviewConfigureHint,
  MONSTER_EQUIPMENT_CATALOG_ERROR,
  MONSTER_LOADING_EQUIPMENT,
  MONSTER_MULTIATTACK_STEPS_LABEL,
} from '../monster-form-labels'
import type { MonsterFormValues } from '../monster-form-values'
import { normalizeMonsterFormValues } from '../normalize-monster-form-values'
import { findMonsterFormActionDraft } from './monster-action-attack-summary'
import {
  monsterArmorClassRules,
  monsterEquipmentCatalog,
  monsterMagicPropertyProvider,
} from '../monster-form-derivation'

function isMultiattackDraft(
  action: MonsterActionDraft,
): action is Extract<MonsterActionDraft, { kind: 'multiattack' }> {
  return action.kind === 'multiattack'
}

function multiattackStepsReady(
  action: Extract<MonsterActionDraft, { kind: 'multiattack' }>,
): boolean {
  return (action.steps ?? []).some(
    (step) =>
      typeof step.count === 'number' &&
      step.count >= 1 &&
      Array.isArray(step.actionIds) &&
      step.actionIds.length > 0,
  )
}

export type MonsterActionMultiattackPreviewUnavailableContext = {
  ctx: ContentFormCtx
  values: MonsterFormValues
  action: Extract<MonsterActionDraft, { kind: 'multiattack' }>
}

export function resolveMonsterActionMultiattackPreviewGuidance({
  ctx,
}: MonsterActionMultiattackPreviewUnavailableContext): string {
  const configure = formatMonsterActionMultiattackPreviewConfigureHint
  if (ctx.equipmentCatalogStatus === 'error') return MONSTER_EQUIPMENT_CATALOG_ERROR
  if (ctx.equipmentCatalogStatus !== 'ready') return MONSTER_LOADING_EQUIPMENT
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
  equipment: readonly EquipmentInstance[]
  equipmentCatalog: CreatureEquipmentCatalog
  magicPropertyProvider: MagicPropertyDefinitionProvider
}): string {
  return formatMonsterMultiattack({
    monsterName: input.monsterName,
    action: input.action,
    actions: input.actions,
    equipment: input.equipment,
    equipmentCatalog: input.equipmentCatalog,
    magicPropertyProvider: input.magicPropertyProvider,
  })
}

function renderMultiattackProse(
  values: MonsterFormValues,
  ctx: ContentFormCtx,
  action: Extract<MonsterActionDraft, { kind: 'multiattack' }>,
): string {
  const armorClassRules = monsterArmorClassRules(ctx)
  const normalized = normalizeMonsterFormValues(values, {
    intent: 'draft',
    mode: 'create',
    armorClassRules,
  })
  return buildMonsterMultiattackSentence({
    monsterName: normalized.name?.trim() || 'Creature',
    action,
    actions: (normalized.actions ?? []) as MonsterAction[],
    equipment: (normalized.equipment ?? []) as EquipmentInstance[],
    equipmentCatalog: monsterEquipmentCatalog(ctx),
    magicPropertyProvider: monsterMagicPropertyProvider(ctx),
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
    input.ctx.equipmentCatalogStatus !== 'ready' ||
    !monsterArmorClassRules(input.ctx)
  ) {
    return unavailableMultiattackPreview(guidanceContext)
  }

  const prose = renderMultiattackProse(input.values, input.ctx, draft).trim()
  if (!prose) return unavailableMultiattackPreview(guidanceContext)

  return { status: 'ready', prose }
}
