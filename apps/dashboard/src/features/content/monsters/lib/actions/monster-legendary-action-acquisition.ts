import {
  formatSpellCastAtLevelName,
  listDirectSpellCastingSources,
  type ResolvedSpellCastingSource,
  type SpellCastingSections,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  LEGENDARY_CAST_SPELL_DEFAULT_NAME,
  LEGENDARY_CAST_SPELL_DESCRIPTION,
  LEGENDARY_CAST_SPELL_DISABLED_NOTE,
  LEGENDARY_CAST_SPELL_LABEL,
  LEGENDARY_CUSTOM_DESCRIPTION,
  LEGENDARY_CUSTOM_LABEL,
  LEGENDARY_REFERENCE_DESCRIPTION,
  LEGENDARY_REFERENCE_DISABLED_NOTE,
  LEGENDARY_REFERENCE_LABEL,
  LEGENDARY_SPELLCASTING_DEFAULT_NAME,
  LEGENDARY_SPELLCASTING_DESCRIPTION,
  LEGENDARY_SPELLCASTING_DISABLED_NOTE,
  LEGENDARY_SPELLCASTING_LABEL,
} from '../monster-form-labels'
import type { MonsterFormValues } from '../monster-form-values'
import { createSpellActionDraft } from './monster-action-acquisition'
import { createMonsterRowId } from '../monster-row-id'
import { isLegendaryReferenceTarget } from './legendary-action-category'
import type { MonsterActionDraftRow } from './monster-action-presets'

export const LEGENDARY_ACTION_ACQUISITION_GROUPS = [
  { id: 'existing', label: 'Use existing' },
  { id: 'new', label: 'Create new' },
] as const

export type LegendaryActionAcquisitionGroupId =
  (typeof LEGENDARY_ACTION_ACQUISITION_GROUPS)[number]['id']

type LegendaryAcquisitionItem = {
  id: string
  label: string
  groupId: LegendaryActionAcquisitionGroupId
  metadata?: string
  disabled?: boolean
  note?: string
}

function spellRows(values: MonsterFormValues): MonsterActionDraftRow[] {
  return [
    ...(values.actions ?? []),
    ...(values.bonusActions ?? []),
    ...(values.reactions ?? []),
  ] as MonsterActionDraftRow[]
}

function sourceHasSelectedSpell(
  values: MonsterFormValues,
  source: ResolvedSpellCastingSource,
): boolean {
  const row = spellRows(values).find((entry) => entry.id === source.id && entry.kind === 'spell')
  if (!row || row.kind !== 'spell') return false
  return (row.spells ?? []).some((spell) => Boolean(spell.spellId))
}

/** Direct spell sources outside Legendary Actions that already list a spell. */
export function legendarySpellcastingSources(
  values: MonsterFormValues,
): ResolvedSpellCastingSource[] {
  return listDirectSpellCastingSources(values as SpellCastingSections).filter((source) =>
    sourceHasSelectedSpell(values, source),
  )
}

export function legendaryReferenceTargets(values: MonsterFormValues): MonsterActionDraftRow[] {
  return ((values.actions ?? []) as MonsterActionDraftRow[]).filter(isLegendaryReferenceTarget)
}

export function legendaryActionAcquisitionItems(
  values: MonsterFormValues,
  ctx: Pick<ContentFormCtx, 'spellCatalogStatus'>,
): LegendaryAcquisitionItem[] {
  const targets = legendaryReferenceTargets(values)
  const sources = legendarySpellcastingSources(values)
  const catalogReady = ctx.spellCatalogStatus === 'ready'
  return [
    {
      id: 'legendary:reference',
      label: LEGENDARY_REFERENCE_LABEL,
      groupId: 'existing',
      metadata: LEGENDARY_REFERENCE_DESCRIPTION,
      disabled: targets.length === 0,
      note: targets.length === 0 ? LEGENDARY_REFERENCE_DISABLED_NOTE : undefined,
    },
    {
      id: 'legendary:spellcasting',
      label: LEGENDARY_SPELLCASTING_LABEL,
      groupId: 'existing',
      metadata: LEGENDARY_SPELLCASTING_DESCRIPTION,
      disabled: sources.length === 0,
      note: sources.length === 0 ? LEGENDARY_SPELLCASTING_DISABLED_NOTE : undefined,
    },
    {
      id: 'legendary:cast-spell',
      label: LEGENDARY_CAST_SPELL_LABEL,
      groupId: 'new',
      metadata: LEGENDARY_CAST_SPELL_DESCRIPTION,
      disabled: !catalogReady,
      note: catalogReady ? undefined : LEGENDARY_CAST_SPELL_DISABLED_NOTE,
    },
    {
      id: 'create:special',
      label: LEGENDARY_CUSTOM_LABEL,
      groupId: 'new',
      metadata: LEGENDARY_CUSTOM_DESCRIPTION,
    },
  ]
}

export function createLegendaryActionDraft(
  category: 'reference' | 'spellcasting' | 'cast-spell',
  values: MonsterFormValues,
): MonsterActionDraftRow {
  const id = createMonsterRowId()
  if (category === 'reference') {
    const targets = legendaryReferenceTargets(values)
    return {
      id,
      kind: 'action-reference',
      actionIds: targets.length === 1 && targets[0] ? [targets[0].id] : [],
    }
  }
  if (category === 'spellcasting') {
    const sources = legendarySpellcastingSources(values)
    return {
      id,
      kind: 'spell',
      name: LEGENDARY_SPELLCASTING_DEFAULT_NAME,
      spellInvocation: 'use-entry',
      spells: [{ spellId: undefined }],
      ...(sources.length === 1 && sources[0]
        ? { castingAbility: { kind: 'shared' as const, entryId: sources[0].id } }
        : {}),
    }
  }
  const cast = createSpellActionDraft('legendaryActions', values)
  if (cast.kind !== 'spell') return cast
  return { ...cast, name: LEGENDARY_CAST_SPELL_DEFAULT_NAME, spells: [{ spellId: undefined }] }
}

/** Spells on the selected Spellcasting action, labeled with that action's cast level. */
export function legendarySourceSpellOptions(
  values: MonsterFormValues,
  action: MonsterActionDraftRow,
  spellsById: ReadonlyMap<string, { name: string; level?: number }> | undefined,
): { value: string; label: string }[] {
  if (action.kind !== 'spell' || action.castingAbility?.kind !== 'shared') return []
  const entryId = action.castingAbility.entryId
  const sections = [values.actions, values.bonusActions, values.reactions]
  for (const rows of sections) {
    const source = ((rows ?? []) as MonsterActionDraftRow[]).find(
      (row) => row.id === entryId && row.kind === 'spell',
    )
    if (!source || source.kind !== 'spell') continue
    return (source.spells ?? []).flatMap((spell) => {
      if (!spell.spellId) return []
      const catalogSpell = spellsById?.get(spell.spellId)
      return [
        {
          value: spell.spellId,
          label: formatSpellCastAtLevelName({
            name: catalogSpell?.name ?? spell.spellId,
            castAtLevel: spell.castAtLevel,
            spellLevel: catalogSpell?.level,
          }),
        },
      ]
    })
  }
  return []
}
