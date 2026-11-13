import {
  getMonsterActionKindLabel,
  isPrimarySpellcastingAction,
  MONSTER_ACTION_UNRESOLVED_REFERENCE,
  MONSTER_SPELLCASTING_ACTION_NAME,
  monsterActionAuthoring,
  type ResolvedMonsterActionIdentity,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { masterDetailItemTitle } from '../../../lib/master-detail/master-detail-constants'
import {
  LEGENDARY_ACTION_DEFAULT_NAMES,
  MONSTER_ACTION_ITEM_NOUN,
  MONSTER_USE_DEFAULT_NAME_LABEL,
} from '../monster-form-labels'
import { legendaryActionCategory } from './legendary-action-category'
import { nextDistinctTitle, presentActionReference } from './monster-action-reference-presentation'
import type { MonsterActionSection } from './monster-action-equipment-references'
import type { MonsterFormValues } from '../monster-form-values'
import type { MonsterActionDraftRow } from './monster-action-presets'
import { resolveMonsterFormActionIdentity } from './monster-action-identity'

/**
 * Editor-only labels. `Special` and `Saving throw` stay the vocabulary labels in metadata.
 * These headings are not published names.
 */
const AUTHORED_FALLBACK_BASE = {
  attack: getMonsterActionKindLabel('attack'),
  special: 'Special Ability',
  save: 'Saving Throw',
  'natural-weapon': getMonsterActionKindLabel('natural-weapon'),
  spell: MONSTER_SPELLCASTING_ACTION_NAME,
  multiattack: getMonsterActionKindLabel('multiattack'),
} as const

export interface MonsterActionHeaderName {
  title: string
  fallback: string
  placeholder: string
  mode: 'authored' | 'override'
  /** Primary Spellcasting renders the canonical name with no editor. */
  editable?: boolean
  resetLabel?: string
  sourceName?: string
}

function actionOrdinalLabel(base: string, ordinal: number): string {
  return ordinal === 1 ? base : `${base} ${ordinal}`
}

function publishedTitle(identity: ResolvedMonsterActionIdentity): string | undefined {
  const displayName = identity.displayName.trim()
  if (displayName) return displayName
  if (identity.sourceState === 'missing') return MONSTER_ACTION_UNRESOLVED_REFERENCE
  if (identity.authority !== 'authored') {
    return masterDetailItemTitle(undefined, MONSTER_ACTION_ITEM_NOUN)
  }
  return undefined
}

function queueUntitledAction(
  pendingByKind: Map<string, string[]>,
  action: MonsterActionDraftRow,
  section?: MonsterActionSection,
): void {
  const category = section === 'legendaryActions' ? legendaryActionCategory(action) : undefined
  const group = category ?? action.kind
  const ids = pendingByKind.get(group) ?? []
  ids.push(action.id)
  pendingByKind.set(group, ids)
}

function fallbackTitleBase(kind: string, section?: MonsterActionSection): string {
  const categoryLabel =
    LEGENDARY_ACTION_DEFAULT_NAMES[kind as keyof typeof LEGENDARY_ACTION_DEFAULT_NAMES]
  if (section === 'legendaryActions' && categoryLabel) return categoryLabel
  return (
    AUTHORED_FALLBACK_BASE[kind as keyof typeof AUTHORED_FALLBACK_BASE] ??
    masterDetailItemTitle(undefined, MONSTER_ACTION_ITEM_NOUN)
  )
}

function assignFallbackTitles(
  titles: Map<string, string>,
  taken: Set<string>,
  pendingByKind: Map<string, string[]>,
  section?: MonsterActionSection,
): void {
  for (const [kind, ids] of pendingByKind) {
    const base = fallbackTitleBase(kind, section)
    let ordinal = 1
    for (const id of ids) {
      let label = actionOrdinalLabel(base, ordinal)
      while (taken.has(label)) {
        ordinal += 1
        label = actionOrdinalLabel(base, ordinal)
      }
      titles.set(id, label)
      taken.add(label)
      ordinal += 1
    }
  }
}

function referenceSourceTitles(
  values: MonsterFormValues | undefined,
  ctx: ContentFormCtx,
  section?: MonsterActionSection,
): ReadonlyMap<string, string> | undefined {
  if (section !== 'reactions' && section !== 'legendaryActions') return undefined
  return monsterActionEditorTitles(
    (values?.actions ?? []) as MonsterActionDraftRow[],
    values,
    ctx,
    'actions',
  )
}

/** Display titles for one action section. Empty authored rows get numbered fallbacks. */
export function monsterActionEditorTitles(
  rows: readonly MonsterActionDraftRow[],
  values: MonsterFormValues | undefined,
  ctx: ContentFormCtx,
  section?: MonsterActionSection,
): Map<string, string> {
  const sourceTitles = referenceSourceTitles(values, ctx, section)
  const resolved = rows.map((action) => ({
    action,
    identity: resolveMonsterFormActionIdentity(action, values, ctx),
  }))
  const titles = new Map<string, string>()
  const taken = new Set<string>()
  const pendingByKind = new Map<string, string[]>()
  const pendingReferences: { id: string; base: string }[] = []

  for (const { action, identity } of resolved) {
    if (action.kind === 'action-reference' && sourceTitles) {
      const presentation = presentActionReference({
        name: action.name,
        actionIds: action.actionIds,
        sourceTitles,
      })
      if (presentation.authoredName) {
        titles.set(action.id, presentation.authoredName)
        taken.add(presentation.authoredName)
      } else {
        pendingReferences.push({ id: action.id, base: presentation.fallbackTitle })
      }
      continue
    }
    const published = publishedTitle(identity)
    if (published) {
      titles.set(action.id, published)
      taken.add(published)
      continue
    }
    queueUntitledAction(pendingByKind, action, section)
  }

  assignFallbackTitles(titles, taken, pendingByKind, section)
  for (const pending of pendingReferences) {
    const label = nextDistinctTitle(pending.base, taken)
    titles.set(pending.id, label)
    taken.add(label)
  }
  return titles
}

function withBlankName(action: MonsterActionDraftRow): MonsterActionDraftRow {
  const next = { ...action }
  delete next.name
  return next
}

function authoredHeaderName(input: {
  action: MonsterActionDraftRow
  sectionRows: readonly MonsterActionDraftRow[]
  values: MonsterFormValues | undefined
  ctx: ContentFormCtx
  section?: MonsterActionSection
  title: string
}): MonsterActionHeaderName {
  const clearedRows = input.sectionRows.map((row) =>
    row.id === input.action.id ? withBlankName(row) : row,
  )
  const fallback =
    monsterActionEditorTitles(clearedRows, input.values, input.ctx, input.section).get(
      input.action.id,
    ) ?? input.title
  const storedReferenceName =
    input.action.kind === 'action-reference' ? input.action.name?.trim() : undefined
  return {
    title: input.title,
    fallback,
    placeholder: fallback,
    mode: 'authored',
    ...(storedReferenceName ? { resetLabel: MONSTER_USE_DEFAULT_NAME_LABEL } : {}),
  }
}

function overrideHeaderName(
  identity: ReturnType<typeof resolveMonsterFormActionIdentity>,
  title: string,
): MonsterActionHeaderName {
  const sourceName = identity.defaultName
  const stored = identity.customName
  return {
    title,
    fallback: sourceName || title,
    placeholder: sourceName || '',
    mode: 'override',
    ...(stored ? { resetLabel: MONSTER_USE_DEFAULT_NAME_LABEL } : {}),
    ...(stored && sourceName && stored !== sourceName ? { sourceName } : {}),
  }
}

/** Header binding for one action. Fallbacks stay out of the stored name. */
export function monsterActionHeaderName(input: {
  action: MonsterActionDraftRow
  sectionRows: readonly MonsterActionDraftRow[]
  values: MonsterFormValues | undefined
  ctx: ContentFormCtx
  section?: MonsterActionSection
}): MonsterActionHeaderName {
  if (isPrimarySpellcastingAction(input.action)) {
    return {
      title: MONSTER_SPELLCASTING_ACTION_NAME,
      fallback: MONSTER_SPELLCASTING_ACTION_NAME,
      placeholder: MONSTER_SPELLCASTING_ACTION_NAME,
      mode: 'authored',
      editable: false,
    }
  }
  const identity = resolveMonsterFormActionIdentity(input.action, input.values, input.ctx)
  const titles = monsterActionEditorTitles(
    input.sectionRows,
    input.values,
    input.ctx,
    input.section,
  )
  const title =
    titles.get(input.action.id) ?? masterDetailItemTitle(undefined, MONSTER_ACTION_ITEM_NOUN)
  if (monsterActionAuthoring(input.action).name === 'authored') {
    return authoredHeaderName({ ...input, title })
  }
  return overrideHeaderName(identity, title)
}
