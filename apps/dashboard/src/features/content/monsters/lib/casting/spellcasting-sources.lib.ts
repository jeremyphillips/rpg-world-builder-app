import {
  isPrimarySpellcastingAction,
  listDirectSpellCastingSources,
  PRIMARY_SPELLCASTING_PROFILE,
  type ResolvedSpellCastingSource,
  type SpellCastingSections,
  type SpellCastingSourceRow,
} from '@rpg/contracts'

import {
  formatSharedCastingOptionLabel,
  formatSpellcastingActionOptionLabel,
} from './spellcasting-source-labels.lib'

export const MONSTER_CASTING_SHARE_GROUP_LABEL = "Use another action's ability"

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

type SpellCountRow = {
  id?: string
  kind?: string
  castingAbility?: { kind?: string; ability?: string }
  spells?: readonly { spellId?: string }[]
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

export function conventionalSpellcastingSources(sections: FormCastingSections) {
  return listDirectSpellCastingSources(asSpellCastingSections(sections)).filter(
    (source) => source.profile === PRIMARY_SPELLCASTING_PROFILE,
  )
}

export function primarySpellcastingProfile(sections: FormCastingSections) {
  const resolved = asSpellCastingSections(sections)
  for (const section of ['actions', 'bonusActions', 'reactions', 'legendaryActions'] as const) {
    for (const row of resolved[section] ?? []) {
      if (isPrimarySpellcastingAction(row)) return row
    }
  }
  return undefined
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
  return sources.map((source: ResolvedSpellCastingSource) => ({
    value: source.id,
    label: formatSpellcastingActionOptionLabel(source, sources, spellCountFor(sections, source.id)),
  }))
}
