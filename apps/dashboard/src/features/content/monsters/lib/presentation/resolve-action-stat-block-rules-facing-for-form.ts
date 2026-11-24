import {
  availableBodyRows,
  CHALLENGE_RATING_MECHANICS,
  MONSTER_ACTION_KINDS,
  resolveMonsterDraftAttackEntry,
  findSpellCastingSource,
  createSpellCatalogContext,
  resolveSpellReferenceOutcome,
  isMonsterActionAttackKind,
  isMultiattackUseClause,
  monsterActionSectionRows,
  monsterRichTextIsEmpty,
  monsterReferencedActionIds,
  type DerivedFieldReason,
  type DerivedMonsterAttackLine,
  type FacingReason,
  type Monster,
  type MonsterAction,
  type MonsterActionAttackProfile,
  type MonsterBonusAction,
  type MonsterLegendaryAction,
  type MonsterReaction,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { resolveMonsterActionAttackPreviewReason } from '../actions/previews/monster-action-attack-summary'
import { findMonsterFormActionDraft } from '../actions/previews/monster-action-draft-lookup'
import type { MonsterActionSection } from '../actions/references/monster-action-equipment-references'
import {
  monsterArmorClassRules,
  monsterEquipmentCatalog,
  monsterMagicPropertyProvider,
} from '../monster-form-derivation'
import type { MonsterFormValues } from '../monster-form-values'
import { normalizeMonsterDraftForPreview } from '../normalize-monster-form-values'

import {
  actionReferenceHeadings,
  buildSpellDisplayContext,
  MONSTER_UNRESOLVED_CATALOG_REFERENCE,
  resolveActionStatBlockRulesFacing,
  type MonsterActionRulesFacing,
  type SpellDisplayContext,
} from './resolve-action-stat-block-rules-facing'

type PublishedAction = MonsterAction | MonsterBonusAction | MonsterReaction | MonsterLegendaryAction

export type MonsterActionRulesPreviewOutcome =
  | { status: 'unavailable'; reason: FacingReason }
  | { status: 'incomplete'; reason: FacingReason }
  | { status: 'invalid'; reason: FacingReason }
  | { status: 'failed'; reason: FacingReason }
  | {
      status: 'ready'
      facing: MonsterActionRulesFacing
      attackProfile?: MonsterActionAttackProfile
      attackLine?: DerivedMonsterAttackLine
    }

function sectionRows(monster: Monster, section: MonsterActionSection): PublishedAction[] {
  if (section === 'legendaryActions') {
    return availableBodyRows(
      monsterActionSectionRows<MonsterLegendaryAction>(monster, 'legendaryActions'),
    )
  }
  return availableBodyRows(monster[section] as PublishedAction[])
}

function derivedSection(
  section: MonsterActionSection,
): 'actions' | 'bonusActions' | 'reactions' | 'legendaryActions' {
  return section
}

function equipmentCatalogReason(ctx: ContentFormCtx): FacingReason {
  if (ctx.equipmentCatalogStatus === 'error') {
    return { code: 'catalog-error', catalog: 'equipment' }
  }
  return { code: 'catalog-pending', catalog: 'equipment' }
}

function spellCatalogReason(ctx: ContentFormCtx): FacingReason {
  if (ctx.spellCatalogStatus === 'error') {
    return { code: 'catalog-error', catalog: 'spells' }
  }
  return { code: 'catalog-pending', catalog: 'spells' }
}

function attackCatalogReason(
  action: PublishedAction,
  monster: Monster,
  ctx: ContentFormCtx,
): FacingReason | undefined {
  if (action.kind !== 'weapon') return undefined
  if (ctx.equipmentCatalogStatus !== 'ready') return equipmentCatalogReason(ctx)

  const entry = monster.equipment?.find((row) => row.entryId === action.equipmentEntryId)
  const equipment = entry && monsterEquipmentCatalog(ctx).get(entry.equipmentId)
  if (equipment?.kind !== 'weapon') return { code: 'missing-equipment-reference' }
  return undefined
}

function referencedActionReason(
  action: PublishedAction,
  monster: Monster,
  ctx: ContentFormCtx,
): FacingReason | undefined {
  const targets =
    action.kind === 'multiattack' ? [...monster.actions, ...monster.bonusActions] : monster.actions
  for (const id of monsterReferencedActionIds(action)) {
    const target = targets.find((candidate) => candidate.id === id)
    if (!target) return { code: 'missing-action-reference' }
    if (target.kind !== 'weapon') continue
    const reason = attackCatalogReason(target, monster, ctx)
    if (reason) return reason
  }
  return undefined
}

function multiattackSpellChoices(action: Extract<PublishedAction, { kind: 'multiattack' }>) {
  const steps = [...action.steps, ...(action.alternative?.steps ?? [])]
  return [
    ...steps.flatMap<{ spellId?: string }>((step) => {
      if (!isMultiattackUseClause(step)) return []
      return step.mode === 'choice' ? (step.choices ?? []) : [step]
    }),
    ...(action.replacement?.choices ?? []),
  ]
}

function spellCatalogReferenceReason(
  spells: readonly { spellId?: string }[],
  ctx: ContentFormCtx,
): FacingReason | undefined {
  if (ctx.spellCatalogStatus !== 'ready') return spellCatalogReason(ctx)
  const catalog = createSpellCatalogContext({
    status: ctx.spellCatalogStatus,
    spellsById: ctx.spellCatalogById,
  })
  if (
    spells.some(
      ({ spellId }) =>
        spellId !== undefined &&
        resolveSpellReferenceOutcome(spellId, catalog).status === 'unresolved',
    )
  ) {
    return { code: 'missing-spell-reference' }
  }
  return undefined
}

function savingThrowSourceReason(
  action: Extract<PublishedAction, { kind: 'save' | 'special' }>,
  monster: Monster,
): FacingReason | undefined {
  const source = action.kind === 'save' ? action.dcSource : action.savingThrow?.dcSource
  if (source?.kind !== 'spellcasting' || source.castingAbility?.kind !== 'shared') return undefined
  if (!findSpellCastingSource(monster, source.castingAbility.entryId)) {
    return { code: 'missing-action-reference' }
  }
  return undefined
}

function selectedActionCatalogReason(
  action: PublishedAction,
  monster: Monster,
  ctx: ContentFormCtx,
): FacingReason | undefined {
  if (action.kind === 'multiattack') {
    const reason = referencedActionReason(action, monster, ctx)
    if (reason) return reason
    const spells = multiattackSpellChoices(action)
    return spells.some(({ spellId }) => spellId !== undefined)
      ? spellCatalogReferenceReason(spells, ctx)
      : undefined
  }
  if (action.kind === 'action-reference' || action.kind === 'parry') {
    return referencedActionReason(action, monster, ctx)
  }
  if (action.kind === 'save' || action.kind === 'special') {
    return savingThrowSourceReason(action, monster)
  }
  if (isMonsterActionAttackKind(action.kind)) return attackCatalogReason(action, monster, ctx)
  if (action.kind === 'spell') return spellCatalogReferenceReason(action.spells, ctx)
  return undefined
}

function derivedAttackReason(
  reason: DerivedFieldReason,
  values: MonsterFormValues,
  ctx: ContentFormCtx,
  actionId: string,
): FacingReason {
  if (reason === 'missing-input') {
    const draft = findMonsterFormActionDraft(values, ctx, actionId)
    if (draft && isMonsterActionAttackKind(draft.kind)) {
      return resolveMonsterActionAttackPreviewReason({ ctx, values, action: draft })
    }
    return { code: 'missing-rules-text' }
  }
  if (reason === 'missing-reference') return { code: 'unresolvable-record' }
  if (reason === 'conflict') return { code: 'derived-conflict' }
  return { code: 'unexpected' }
}

function incompleteReasonForAction(
  action: ReturnType<typeof findMonsterFormActionDraft>,
  values: MonsterFormValues,
  ctx: ContentFormCtx,
): FacingReason {
  if (!action) return { code: 'missing-rules-text' }
  if (action.kind === 'multiattack') return { code: 'missing-multiattack-steps' }
  if (action.kind === 'spell') return { code: 'missing-spell-configuration' }
  if (isMonsterActionAttackKind(action.kind)) {
    return resolveMonsterActionAttackPreviewReason({ ctx, values, action })
  }
  return { code: 'missing-rules-text' }
}

function facingHasRulesBody(facing: MonsterActionRulesFacing): boolean {
  if (facing.rulesProse && facing.rulesProse.length > 0) return true
  if (facing.attackLine && facing.attackLine !== MONSTER_UNRESOLVED_CATALOG_REFERENCE) {
    return true
  }
  if (facing.descriptionHtml && !monsterRichTextIsEmpty(facing.descriptionHtml)) return true
  return false
}

// fallow-ignore-next-line complexity
export function resolveActionStatBlockRulesFacingForForm(input: {
  values: MonsterFormValues
  ctx: ContentFormCtx
  actionId: string
  section: MonsterActionSection
}): MonsterActionRulesPreviewOutcome {
  const armorClassRules = monsterArmorClassRules(input.ctx)
  if (!armorClassRules) {
    return {
      status: 'unavailable',
      reason: { code: 'catalog-pending', catalog: 'armor-class-rules' },
    }
  }

  const magicPropertyProvider = monsterMagicPropertyProvider(input.ctx)
  if (!input.ctx.rulesetId || !magicPropertyProvider) {
    return {
      status: 'unavailable',
      reason: { code: 'catalog-pending', catalog: 'armor-class-rules' },
    }
  }

  let normalized: Monster
  let action: PublishedAction
  let attackDraft: ReturnType<typeof resolveMonsterDraftAttackEntry> | undefined
  let spellContext: SpellDisplayContext

  try {
    normalized = normalizeMonsterDraftForPreview(input.values, {
      intent: 'draft',
      mode: 'create',
      armorClassRules,
    })
    const selected = sectionRows(normalized, input.section).find((row) => row.id === input.actionId)
    if (!selected) return { status: 'incomplete', reason: { code: 'missing-rules-text' } }

    if (!MONSTER_ACTION_KINDS.includes(selected.kind)) {
      return { status: 'invalid', reason: { code: 'unsupported-kind' } }
    }

    action = selected
    if (action.kind === 'weapon' && !action.equipmentEntryId) {
      return { status: 'incomplete', reason: { code: 'missing-attack-input', field: 'equipment' } }
    }
    const reason = selectedActionCatalogReason(action, normalized, input.ctx)
    if (reason) return { status: 'unavailable', reason }

    if (isMonsterActionAttackKind(action.kind)) {
      attackDraft = resolveMonsterDraftAttackEntry({
        action,
        monster: normalized,
        section: derivedSection(input.section),
        equipmentCatalog: monsterEquipmentCatalog(input.ctx),
        proficiencyBonus: CHALLENGE_RATING_MECHANICS[normalized.challengeRating]?.proficiencyBonus,
        magicPropertyProvider,
      })
    }
    const catalogState = 'ready' as const
    spellContext = buildSpellDisplayContext({
      monster: normalized,
      equipmentById: monsterEquipmentCatalog(input.ctx),
      catalogState,
      spellsById: input.ctx.spellCatalogById,
      spellCatalogStatus: input.ctx.spellCatalogStatus === 'ready' ? 'ready' : 'unavailable',
      magicPropertyProvider,
    })
  } catch (error) {
    console.error('resolveActionStatBlockRulesFacingForForm failed', {
      actionId: input.actionId,
      section: input.section,
      error,
    })
    return { status: 'failed', reason: { code: 'unexpected' } }
  }

  if (attackDraft?.result.status === 'unavailable') {
    const { reason } = attackDraft.result
    return {
      status: reason === 'missing-input' ? 'incomplete' : 'unavailable',
      reason: derivedAttackReason(reason, input.values, input.ctx, input.actionId),
    }
  }

  const attackLine = attackDraft?.result.value
  const derived = attackLine
    ? {
        attacks: [attackLine],
        proficiencyBonus:
          CHALLENGE_RATING_MECHANICS[normalized.challengeRating]?.proficiencyBonus ?? 0,
        spellcasting: [],
      }
    : null
  const headings = actionReferenceHeadings(sectionRows(normalized, input.section), spellContext)

  const facing = resolveActionStatBlockRulesFacing(
    action,
    derivedSection(input.section),
    derived,
    'ready',
    spellContext,
    headings,
  )

  if (!facingHasRulesBody(facing)) {
    const draftAction = findMonsterFormActionDraft(input.values, input.ctx, input.actionId)
    return {
      status: 'incomplete',
      reason: incompleteReasonForAction(draftAction, input.values, input.ctx),
    }
  }

  return {
    status: 'ready',
    facing,
    ...(attackDraft?.profile ? { attackProfile: attackDraft.profile } : {}),
    ...(attackLine ? { attackLine } : {}),
  }
}

/** @deprecated Use `resolveActionStatBlockRulesFacingForForm` — kept for title hook migration. */
export function tryResolveActionStatBlockRulesFacingForForm(input: {
  values: MonsterFormValues
  ctx: ContentFormCtx
  actionId: string
  section: MonsterActionSection
}): MonsterActionRulesFacing | null {
  const outcome = resolveActionStatBlockRulesFacingForForm(input)
  return outcome.status === 'ready' ? outcome.facing : null
}
