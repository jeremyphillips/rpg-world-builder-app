import {
  isPrimarySpellcastingAction,
  listDirectSpellCastingSources,
  monsterActionSectionRows,
  PRIMARY_SPELLCASTING_PROFILE,
  type ResolvedSpellCastingSource,
  type SpellCastingSections,
  type SpellCastingSourceRow,
} from '@rpg/contracts'

import {
  formatSharedCastingOptionLabel,
  formatSpellcastingActionOptionLabel,
} from './spellcasting-source-labels.lib'
import type { MonsterActionDraftRow } from '../actions/monster-action-presets'
import type { MonsterFormValues } from '../monster-form-values'
import {
  monsterFormSectionRows,
  type MonsterFormActionSectionBody,
} from '../actions/monster-action-section-access'

export const MONSTER_CASTING_SHARE_GROUP_LABEL = "Use another action's ability"

export type FormCastingSections = {
  actions?: readonly MonsterActionDraftRow[]
  bonusActions?: readonly MonsterActionDraftRow[]
  reactions?: readonly MonsterActionDraftRow[]
  legendaryActions?: MonsterFormValues['legendaryActions']
}

function asSpellCastingSections(sections: FormCastingSections): SpellCastingSections {
  const block = sections.legendaryActions
  return {
    actions: (sections.actions ?? []) as SpellCastingSourceRow[],
    bonusActions: (sections.bonusActions ?? []) as SpellCastingSourceRow[],
    reactions: (sections.reactions ?? []) as SpellCastingSourceRow[],
    ...(block
      ? {
          legendaryActions: {
            ...(block.uses !== undefined ? { uses: block.uses } : {}),
            ...(block.usesInLair !== undefined ? { usesInLair: block.usesInLair } : {}),
            actions: (block.actions ?? []) as SpellCastingSourceRow[],
          },
        }
      : {}),
  } as SpellCastingSections
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
    for (const row of monsterActionSectionRows(resolved, section)) {
      if (isPrimarySpellcastingAction(row)) return row
    }
  }
  return undefined
}

function spellCountFor(sections: FormCastingSections, entryId: string): number {
  const rows = (['actions', 'bonusActions', 'reactions'] as const).flatMap((section) =>
    monsterFormSectionRows(sections as MonsterFormActionSectionBody, section),
  ) as SpellCountRow[]
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
