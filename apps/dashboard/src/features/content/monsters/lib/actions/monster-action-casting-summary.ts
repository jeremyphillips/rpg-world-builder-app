import {
  getAbilityLabel,
  getContentTypeSentenceForm,
  listDirectSpellCastingSources,
  MONSTER_SPELLCASTING_ACTION_NAME,
  resolveMonsterActionIdentity,
  type Ability,
  type MonsterActionDraft,
  type ResolvedSpellCastingSource,
  type SpellCastingSections,
  type SpellCastingSourceRow,
} from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

import { masterDetailItemTitle } from '../../../lib/master-detail/master-detail-constants'
import { monsterActionSectionHeading } from '../monster-form-labels'
import { MONSTER_ACTION_ITEM_NOUN } from '../monster-form-labels'

type CastingRow = {
  id: string
  kind: string
  name?: string
  castingAbility?: { kind?: string; ability?: string; entryId?: string }
  bonusSource?: {
    kind?: string
    castingAbility?: { kind?: string; ability?: Ability; entryId?: string }
  }
  dcSource?: {
    kind?: string
    castingAbility?: { kind?: string; ability?: Ability; entryId?: string }
  }
}

export const MONSTER_CASTING_ABILITY_GROUP_LABEL = 'Choose an ability'
export const MONSTER_CASTING_SHARE_GROUP_LABEL = "Use another action's ability"

type SpellCountRow = {
  id?: string
  kind?: string
  castingAbility?: { kind?: string; ability?: Ability }
  spells?: readonly { spellId?: string }[]
}

type FormCastingSections = {
  actions?: readonly unknown[]
  bonusActions?: readonly unknown[]
  reactions?: readonly unknown[]
  legendaryActions?: readonly unknown[]
}

function asSpellCastingSections(sections: FormCastingSections): SpellCastingSections {
  const rows = (section: readonly unknown[] | undefined) =>
    (section ?? []) as SpellCastingSourceRow[]
  return {
    actions: rows(sections.actions),
    bonusActions: rows(sections.bonusActions),
    reactions: rows(sections.reactions),
    legendaryActions: rows(sections.legendaryActions),
  }
}

function sourceTitle(source: ResolvedSpellCastingSource): string {
  return source.name?.trim() || masterDetailItemTitle(undefined, MONSTER_ACTION_ITEM_NOUN)
}

function sourceNameKey(source: ResolvedSpellCastingSource): string {
  return source.name?.trim() ?? ''
}

export function formatSharedCastingOptionLabel(
  source: ResolvedSpellCastingSource,
  sources: readonly ResolvedSpellCastingSource[],
): string {
  const base = `${sourceTitle(source)} (${getAbilityLabel(source.ability)})`
  const collisions = sources.filter((other) => sourceNameKey(other) === sourceNameKey(source))
  if (collisions.length < 2) return base
  return joinInlineMetadata([base, monsterActionSectionHeading(source.section)])
}

/** Action title with its spell count and ability. Section is added only when names collide. */
export function formatSpellcastingActionOptionLabel(
  source: ResolvedSpellCastingSource,
  sources: readonly ResolvedSpellCastingSource[],
  spellCount: number,
): string {
  const collisions = sources.filter((other) => sourceNameKey(other) === sourceNameKey(source))
  return joinInlineMetadata([
    sourceTitle(source),
    `${spellCount} ${getContentTypeSentenceForm('spells', spellCount)}`,
    getAbilityLabel(source.ability),
    collisions.length < 2 ? undefined : monsterActionSectionHeading(source.section),
  ])
}

export function sharedCastingOptions(
  values: FormCastingSections,
  actionId: string,
): { value: string; label: string }[] {
  const sources = listDirectSpellCastingSources(asSpellCastingSections(values)).filter(
    (source) => source.id !== actionId,
  )
  return sources.map((source) => ({
    value: source.id,
    label: formatSharedCastingOptionLabel(source, sources),
  }))
}

export function monsterCastingDependentLabels(
  values: FormCastingSections,
  sourceId: string,
): string[] {
  const rows = [
    ...(values.actions ?? []),
    ...(values.bonusActions ?? []),
    ...(values.reactions ?? []),
    ...(values.legendaryActions ?? []),
  ] as CastingRow[]
  return rows.flatMap((row) => {
    if (row.id === sourceId || !rowUsesCastingSource(row, sourceId)) return []
    const identity = resolveMonsterActionIdentity({
      action: row as MonsterActionDraft,
      equipmentCatalogStatus: 'ready',
    })
    return [
      identity.displayName.trim() || masterDetailItemTitle(undefined, MONSTER_ACTION_ITEM_NOUN),
    ]
  })
}

function sharedEntryId(
  casting: { kind?: string; entryId?: string } | undefined,
): string | undefined {
  if (casting?.kind !== 'shared') return undefined
  return casting.entryId
}

function rowUsesCastingSource(row: CastingRow, sourceId: string): boolean {
  if (row.kind === 'spell') return sharedEntryId(row.castingAbility) === sourceId
  if (row.kind === 'attack' && row.bonusSource?.kind === 'spell') {
    return sharedEntryId(row.bonusSource.castingAbility) === sourceId
  }
  if (row.kind === 'save' && row.dcSource?.kind === 'spell') {
    return sharedEntryId(row.dcSource.castingAbility) === sourceId
  }
  return false
}

export function conventionalSpellcastingSources(sections: FormCastingSections) {
  return listDirectSpellCastingSources(asSpellCastingSections(sections)).filter(
    (source) => source.name?.trim() === MONSTER_SPELLCASTING_ACTION_NAME,
  )
}

export function spellcastingNameTaken(sections: FormCastingSections): boolean {
  const resolved = asSpellCastingSections(sections)
  for (const section of ['actions', 'bonusActions', 'reactions', 'legendaryActions'] as const) {
    for (const row of resolved[section] ?? []) {
      if (row.kind === 'spell' && row.name?.trim() === MONSTER_SPELLCASTING_ACTION_NAME) return true
    }
  }
  return false
}

function spellCountFor(sections: FormCastingSections, entryId: string): number {
  const rows = (['actions', 'bonusActions', 'reactions'] as const).flatMap(
    (section) => (sections[section] ?? []) as SpellCountRow[],
  )
  const source = rows.find((row) => row.id === entryId && row.kind === 'spell')
  return (source?.spells ?? []).filter((spell) => Boolean(spell.spellId)).length
}

export function legendarySpellcastingActionOptions(sections: FormCastingSections): {
  value: string
  label: string
}[] {
  const sources = listDirectSpellCastingSources(asSpellCastingSections(sections))
  return sources.map((source) => ({
    value: source.id,
    label: formatSpellcastingActionOptionLabel(source, sources, spellCountFor(sections, source.id)),
  }))
}
