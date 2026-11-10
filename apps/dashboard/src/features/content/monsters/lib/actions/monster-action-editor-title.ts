import {
  getMonsterActionKindLabel,
  MONSTER_ACTION_UNRESOLVED_REFERENCE,
  MONSTER_SPELLCASTING_ACTION_NAME,
  monsterActionAuthoring,
  type ResolvedMonsterActionIdentity,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { masterDetailItemTitle } from '../../../lib/master-detail/master-detail-constants'
import { MONSTER_ACTION_ITEM_NOUN, MONSTER_USE_DEFAULT_NAME_LABEL } from '../monster-form-labels'
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

/** Display titles for one action section. Empty authored rows get numbered fallbacks. */
export function monsterActionEditorTitles(
  rows: readonly MonsterActionDraftRow[],
  values: MonsterFormValues | undefined,
  ctx: ContentFormCtx,
): Map<string, string> {
  const resolved = rows.map((action) => ({
    action,
    identity: resolveMonsterFormActionIdentity(action, values, ctx),
  }))
  const titles = new Map<string, string>()
  const taken = new Set<string>()
  const pendingByKind = new Map<string, string[]>()

  for (const { action, identity } of resolved) {
    const published = publishedTitle(identity)
    if (published) {
      titles.set(action.id, published)
      taken.add(published)
      continue
    }
    const kind = action.kind
    const ids = pendingByKind.get(kind) ?? []
    ids.push(action.id)
    pendingByKind.set(kind, ids)
  }

  for (const [kind, ids] of pendingByKind) {
    const base =
      AUTHORED_FALLBACK_BASE[kind as keyof typeof AUTHORED_FALLBACK_BASE] ??
      masterDetailItemTitle(undefined, MONSTER_ACTION_ITEM_NOUN)
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

  return titles
}

function withBlankName(action: MonsterActionDraftRow): MonsterActionDraftRow {
  const next = { ...action }
  delete next.name
  return next
}

/** Header binding for one action. Fallbacks stay out of the stored name. */
export function monsterActionHeaderName(input: {
  action: MonsterActionDraftRow
  sectionRows: readonly MonsterActionDraftRow[]
  values: MonsterFormValues | undefined
  ctx: ContentFormCtx
}): MonsterActionHeaderName {
  const identity = resolveMonsterFormActionIdentity(input.action, input.values, input.ctx)
  const titles = monsterActionEditorTitles(input.sectionRows, input.values, input.ctx)
  const title =
    titles.get(input.action.id) ?? masterDetailItemTitle(undefined, MONSTER_ACTION_ITEM_NOUN)
  const authored = monsterActionAuthoring(input.action).name === 'authored'
  if (authored) {
    const clearedRows = input.sectionRows.map((row) =>
      row.id === input.action.id ? withBlankName(row) : row,
    )
    const fallback =
      monsterActionEditorTitles(clearedRows, input.values, input.ctx).get(input.action.id) ?? title
    return {
      title,
      fallback,
      placeholder: fallback,
      mode: 'authored',
    }
  }

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
