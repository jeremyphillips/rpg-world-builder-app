import {
  availableBodyRows,
  deriveMonsterStatBlock,
  formatMonsterSpellEntry,
  joinStatBlockProseDocument,
  type StatBlockProseDocument,
  getContentTypeTerm,
  resolveMonsterActionIdentity,
  type MonsterAction,
  type MonsterActionDraft,
  type MonsterLegendaryAction,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { monsterFormSectionRows } from '../monster-action-section-access'
import {
  monsterArmorClassRules,
  monsterEquipmentCatalog,
  monsterMagicPropertyProvider,
  monsterSkillCatalog,
} from '../../monster-form-derivation'
import {
  formatMonsterActionSpellPreviewConfigureHint,
  MONSTER_CHALLENGE_HEADING,
  MONSTER_EQUIPMENT_CATALOG_ERROR,
  MONSTER_LOADING_EQUIPMENT,
  MONSTER_LOADING_SPELLS,
  MONSTER_SPELL_CATALOG_ERROR,
} from '../../monster-form-labels'
import { SPELLCASTING_ABILITY_FIELD_LABEL } from '../../../../lib/forms/mechanics/spellcasting-ability-field-copy'
import type { MonsterFormValues } from '../../monster-form-values'
import { normalizeMonsterDraftForPreview } from '../../normalize-monster-form-values'
import type { MonsterActionSection } from '../references/monster-action-equipment-references'
import { findMonsterFormActionDraft } from './monster-action-draft-lookup'

type SpellEntry = Extract<MonsterAction, { kind: 'spell' }>

const SPELL_SECTIONS = ['actions', 'bonusActions', 'reactions', 'legendaryActions'] as const

function spellCatalogStatus(ctx: ContentFormCtx): 'ready' | 'unavailable' {
  return ctx.spellCatalogStatus === 'ready' ? 'ready' : 'unavailable'
}

export function buildMonsterSpellsInBody(
  values: MonsterFormValues,
): ReadonlyMap<string, Extract<MonsterAction | MonsterLegendaryAction, { kind: 'spell' }>> {
  const sectionRows = SPELL_SECTIONS.flatMap((section) => monsterFormSectionRows(values, section))
  const rows = availableBodyRows(sectionRows).filter(
    (row): row is Extract<MonsterAction | MonsterLegendaryAction, { kind: 'spell' }> =>
      row.kind === 'spell',
  )
  return new Map(rows.map((row) => [row.id, row]))
}

function isSpellDraft(
  action: MonsterActionDraft,
): action is Extract<MonsterActionDraft, { kind: 'spell' }> {
  return action.kind === 'spell'
}

function castingAbilityConfigured(
  action: Extract<MonsterActionDraft, { kind: 'spell' }>,
  spellsInBody: ReadonlyMap<
    string,
    Extract<MonsterAction | MonsterLegendaryAction, { kind: 'spell' }>
  >,
): boolean {
  const casting = action.castingAbility
  if (!casting?.kind) return false
  if (casting.kind === 'ability') return Boolean(casting.ability)
  if (casting.kind === 'shared') {
    return Boolean(casting.entryId && spellsInBody.has(casting.entryId))
  }
  return false
}

function spellRowsPopulated(action: Extract<MonsterActionDraft, { kind: 'spell' }>): boolean {
  return (action.spells ?? []).some(
    (row) => typeof row.spellId === 'string' && row.spellId.length > 0,
  )
}

export type MonsterActionSpellPreviewUnavailableContext = {
  ctx: ContentFormCtx
  values: MonsterFormValues
  action: Extract<MonsterActionDraft, { kind: 'spell' }>
}

export function resolveMonsterActionSpellPreviewGuidance({
  ctx,
  values,
  action,
}: MonsterActionSpellPreviewUnavailableContext): string {
  const configure = formatMonsterActionSpellPreviewConfigureHint
  if (ctx.spellCatalogStatus === 'error') return MONSTER_SPELL_CATALOG_ERROR
  if (ctx.spellCatalogStatus !== 'ready') return MONSTER_LOADING_SPELLS
  if (ctx.equipmentCatalogStatus === 'error') return MONSTER_EQUIPMENT_CATALOG_ERROR
  if (ctx.equipmentCatalogStatus !== 'ready') return MONSTER_LOADING_EQUIPMENT

  const spellsInBody = buildMonsterSpellsInBody(values)
  if (!castingAbilityConfigured(action, spellsInBody)) {
    return configure(SPELLCASTING_ABILITY_FIELD_LABEL)
  }
  if (!spellRowsPopulated(action)) {
    return configure(getContentTypeTerm('spells').label)
  }
  if (!values.challengeRating) return configure(MONSTER_CHALLENGE_HEADING)
  return configure(SPELLCASTING_ABILITY_FIELD_LABEL)
}

function tryDeriveSpellLine(
  values: MonsterFormValues,
  ctx: ContentFormCtx,
  actionId: string,
  section: MonsterActionSection,
) {
  const armorClassRules = monsterArmorClassRules(ctx)
  if (!armorClassRules || ctx.equipmentCatalogStatus !== 'ready') return undefined
  const normalized = normalizeMonsterDraftForPreview(values, {
    intent: 'draft',
    mode: 'create',
    armorClassRules,
  })
  try {
    const derived = deriveMonsterStatBlock({
      monster: normalized,
      equipmentCatalog: monsterEquipmentCatalog(ctx),
      skillCatalog: monsterSkillCatalog(ctx),
      armorClassRules,
      magicPropertyProvider: monsterMagicPropertyProvider(ctx),
    })
    return derived.spellcasting.find((line) => line.id === actionId && line.section === section)
  } catch {
    return undefined
  }
}

export type MonsterActionSpellPreview =
  | { status: 'unavailable'; guidance: string }
  | { status: 'ready'; rulesProse: StatBlockProseDocument }

function unavailableSpellPreview(
  guidanceContext: MonsterActionSpellPreviewUnavailableContext,
): MonsterActionSpellPreview {
  return {
    status: 'unavailable',
    guidance: resolveMonsterActionSpellPreviewGuidance(guidanceContext),
  }
}

function spellPreviewReadyToFormat(
  draft: Extract<MonsterActionDraft, { kind: 'spell' }>,
  spellsInBody: ReturnType<typeof buildMonsterSpellsInBody>,
  ctx: ContentFormCtx,
): boolean {
  if (!castingAbilityConfigured(draft, spellsInBody)) return false
  if (!spellRowsPopulated(draft)) return false
  if (ctx.spellCatalogStatus !== 'ready' || ctx.equipmentCatalogStatus !== 'ready') return false
  return Boolean(monsterArmorClassRules(ctx))
}

function renderSpellPreviewBody(input: {
  values: MonsterFormValues
  ctx: ContentFormCtx
  actionId: string
  section: MonsterActionSection
  draft: Extract<MonsterActionDraft, { kind: 'spell' }>
  spellsInBody: ReturnType<typeof buildMonsterSpellsInBody>
}): StatBlockProseDocument {
  const armorClassRules = monsterArmorClassRules(input.ctx)!
  const normalized = normalizeMonsterDraftForPreview(input.values, {
    intent: 'draft',
    mode: 'create',
    armorClassRules,
  })
  const equipmentCatalogStatus = input.ctx.equipmentCatalogStatus === 'ready' ? 'ready' : 'pending'
  const identity = resolveMonsterActionIdentity({
    action: input.draft,
    equipment: normalized.equipment,
    equipmentCatalog: monsterEquipmentCatalog(input.ctx),
    magicPropertyProvider: monsterMagicPropertyProvider(input.ctx),
    equipmentCatalogStatus,
  })
  const saveDc = tryDeriveSpellLine(input.values, input.ctx, input.actionId, input.section)?.saveDc
  return formatMonsterSpellEntry({
    entry: { ...input.draft, name: identity.displayName } as SpellEntry,
    monsterName: normalized.name?.trim() || 'Creature',
    section: input.section,
    spellsById: input.ctx.spellCatalogById,
    catalogStatus: spellCatalogStatus(input.ctx),
    spellsInBody: input.spellsInBody,
    saveDc,
  }).bodyProse
}

export function buildMonsterActionSpellPreview(input: {
  values: MonsterFormValues
  ctx: ContentFormCtx
  actionId: string
  section: MonsterActionSection
  unavailableContext?: MonsterActionSpellPreviewUnavailableContext
}): MonsterActionSpellPreview | null {
  const draft = findMonsterFormActionDraft(input.values, input.ctx, input.actionId)
  if (!draft || !isSpellDraft(draft)) return null

  const spellsInBody = buildMonsterSpellsInBody(input.values)
  const guidanceContext = input.unavailableContext ?? {
    ctx: input.ctx,
    values: input.values,
    action: draft,
  }

  if (!spellPreviewReadyToFormat(draft, spellsInBody, input.ctx)) {
    return unavailableSpellPreview(guidanceContext)
  }

  const rulesProse = renderSpellPreviewBody({ ...input, draft, spellsInBody })
  if (joinStatBlockProseDocument(rulesProse).trim().length === 0) {
    return unavailableSpellPreview(guidanceContext)
  }

  return { status: 'ready', rulesProse }
}
