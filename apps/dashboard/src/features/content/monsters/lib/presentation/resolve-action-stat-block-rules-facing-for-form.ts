import {
  availableBodyRows,
  CHALLENGE_RATING_MECHANICS,
  deriveSpellcastingLines,
  isMonsterActionAttackKind,
  monsterActionSectionRows,
  monsterRichTextIsEmpty,
  type DerivedFieldReason,
  type DerivedMonsterAttackLine,
  type DerivedMonsterStatBlock,
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
  deriveMonsterFormDraft,
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

function catalogReferenceReason(ctx: ContentFormCtx): FacingReason {
  if (ctx.equipmentCatalogStatus === 'pending' || ctx.equipmentCatalogStatus === 'error') {
    return equipmentCatalogReason(ctx)
  }
  if (ctx.spellCatalogStatus === 'pending' || ctx.spellCatalogStatus === 'error') {
    return spellCatalogReason(ctx)
  }
  return { code: 'catalog-pending', catalog: 'armor-class-rules' }
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
  if (reason === 'missing-reference') return catalogReferenceReason(ctx)
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

// fallow-ignore-next-line complexity
function derivedForFacing(
  values: MonsterFormValues,
  ctx: ContentFormCtx,
): DerivedMonsterStatBlock | null {
  const draft = deriveMonsterFormDraft(values, ctx)
  if (!draft) return null

  const normalized = normalizeMonsterDraftForPreview(values, {
    intent: 'draft',
    mode: 'create',
    armorClassRules: monsterArmorClassRules(ctx)!,
  })

  const proficiencyBonus =
    draft.challenge.status === 'resolved'
      ? draft.challenge.value.proficiencyBonus
      : normalized.challengeRating && normalized.challengeRating in CHALLENGE_RATING_MECHANICS
        ? CHALLENGE_RATING_MECHANICS[
            normalized.challengeRating as keyof typeof CHALLENGE_RATING_MECHANICS
          ].proficiencyBonus
        : 0

  const attacks = draft.attacks
    .filter((entry) => entry.result.status === 'resolved')
    .map((entry) => entry.result.value)

  const savingThrows = draft.savingThrows.status === 'resolved' ? draft.savingThrows.value : {}

  return {
    ac: draft.ac,
    hp: draft.hp.status === 'resolved' ? draft.hp.value.hp : 0,
    hpFormula: draft.hp.status === 'resolved' ? draft.hp.value.formula : '',
    hpClampedToMinimum: draft.hp.status === 'resolved' ? draft.hp.value.clampedToMinimum : false,
    initiativeModifier:
      draft.initiative.status === 'resolved' ? draft.initiative.value.modifier : 0,
    initiativeLabel: draft.initiative.status === 'resolved' ? draft.initiative.value.label : '',
    proficiencyBonus,
    experiencePoints:
      draft.challenge.status === 'resolved' ? draft.challenge.value.experiencePoints : 0,
    passivePerception:
      draft.passivePerception.status === 'resolved' ? draft.passivePerception.value : 10,
    savingThrows,
    skills: draft.skills.status === 'resolved' ? draft.skills.value : [],
    attacks,
    spellcasting: deriveSpellcastingLines(normalized, proficiencyBonus),
    senses: [],
  }
}

function facingHasRulesBody(facing: MonsterActionRulesFacing): boolean {
  if (facing.rulesProse && facing.rulesProse.length > 0) return true
  if (facing.attackLine && facing.attackLine !== MONSTER_UNRESOLVED_CATALOG_REFERENCE) {
    return true
  }
  if (facing.descriptionHtml && !monsterRichTextIsEmpty(facing.descriptionHtml)) return true
  return false
}

function attackDraftState(
  values: MonsterFormValues,
  ctx: ContentFormCtx,
  actionId: string,
  section: MonsterActionSection,
): {
  reason?: DerivedFieldReason
  profile?: MonsterActionAttackProfile
  line?: DerivedMonsterAttackLine
} {
  const draft = deriveMonsterFormDraft(values, ctx)
  if (!draft) return { reason: 'missing-reference' }
  const entry = draft.attacks.find((row) => row.id === actionId && row.section === section)
  if (!entry) return {}
  if (entry.result.status === 'unavailable') return { reason: entry.result.reason }
  return { profile: entry.profile, line: entry.result.value }
}

// fallow-ignore-next-line complexity
export function resolveActionStatBlockRulesFacingForForm(input: {
  values: MonsterFormValues
  ctx: ContentFormCtx
  actionId: string
  section: MonsterActionSection
}): MonsterActionRulesPreviewOutcome {
  if (
    input.ctx.equipmentCatalogStatus === 'pending' ||
    input.ctx.equipmentCatalogStatus === 'error'
  ) {
    return { status: 'unavailable', reason: equipmentCatalogReason(input.ctx) }
  }
  if (input.ctx.spellCatalogStatus === 'pending' || input.ctx.spellCatalogStatus === 'error') {
    return { status: 'unavailable', reason: spellCatalogReason(input.ctx) }
  }

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
  let derived: DerivedMonsterStatBlock | null
  let spellContext: SpellDisplayContext

  try {
    normalized = normalizeMonsterDraftForPreview(input.values, {
      intent: 'draft',
      mode: 'create',
      armorClassRules,
    })
    derived = derivedForFacing(input.values, input.ctx)
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

  const action = sectionRows(normalized, input.section).find((row) => row.id === input.actionId)
  if (!action) {
    return { status: 'incomplete', reason: { code: 'missing-rules-text' } }
  }

  if (isMonsterActionAttackKind(action.kind)) {
    const attackState = attackDraftState(
      input.values,
      input.ctx,
      input.actionId,
      derivedSection(input.section),
    )
    if (attackState.reason === 'conflict') {
      return {
        status: 'unavailable',
        reason: derivedAttackReason('conflict', input.values, input.ctx, input.actionId),
      }
    }
    if (attackState.reason === 'missing-reference') {
      return {
        status: 'unavailable',
        reason: derivedAttackReason('missing-reference', input.values, input.ctx, input.actionId),
      }
    }
    if (attackState.reason === 'missing-input') {
      return {
        status: 'incomplete',
        reason: derivedAttackReason('missing-input', input.values, input.ctx, input.actionId),
      }
    }
  }

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

  const attackDraft = isMonsterActionAttackKind(action.kind)
    ? attackDraftState(input.values, input.ctx, input.actionId, derivedSection(input.section))
    : undefined

  return {
    status: 'ready',
    facing,
    ...(attackDraft?.profile ? { attackProfile: attackDraft.profile } : {}),
    ...(attackDraft?.line ? { attackLine: attackDraft.line } : {}),
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
