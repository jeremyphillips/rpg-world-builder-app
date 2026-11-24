import {
  formatSpellCastAtLevelName,
  getMonsterActionKindLabel,
  listDirectSpellCastingSources,
  MONSTER_ACTION_KIND_ENTRIES,
  type ResolvedSpellCastingSource,
  type SpellCastingSections,
} from '@rpg/contracts'

import type { ButtonDropdownItem } from '@rpg/ui'
import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import {
  LEGENDARY_CAST_SPELL_DEFAULT_NAME,
  LEGENDARY_CAST_SPELL_DESCRIPTION,
  LEGENDARY_CAST_SPELL_DISABLED_NOTE,
  LEGENDARY_CAST_SPELL_LABEL,
  LEGENDARY_CUSTOM_DESCRIPTION,
  LEGENDARY_CUSTOM_LABEL,
  LEGENDARY_ACTION_CATEGORY_LABELS,
  MONSTER_ACTION_REFERENCE_ACQUISITION_LABEL,
  LEGENDARY_REFERENCE_DISABLED_NOTE,
  LEGENDARY_SPELLCASTING_DEFAULT_NAME,
  LEGENDARY_SPELLCASTING_DESCRIPTION,
  LEGENDARY_SPELLCASTING_DISABLED_NOTE,
} from '../../monster-form-labels'
import type { MonsterFormValues } from '../../monster-form-values'
import { createSpellActionDraft } from './monster-action-acquisition'
import { createMonsterRowId } from '../../monster-row-id'
import {
  LEGENDARY_ACQUISITION_OPTION_ID,
  type LegendaryAcquisitionCategory,
} from '../legendary/legendary-action-category'
import { listActionReferenceAcquisitionTargets } from '../reference/action-reference-acquisition'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import {
  type AcquisitionOption,
  resolveAcquisitionAvailability,
  toAcquisitionDropdownItem,
} from '../../../../lib/acquisition'

export const LEGENDARY_ACTION_ACQUISITION_GROUPS = [
  { id: 'existing', label: 'Use existing' },
  { id: 'new', label: 'Create new' },
] as const

export type LegendaryActionAcquisitionGroupId =
  (typeof LEGENDARY_ACTION_ACQUISITION_GROUPS)[number]['id']

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
  const block = values.legendaryActions
  const sections: SpellCastingSections = {
    actions: values.actions,
    bonusActions: values.bonusActions,
    reactions: values.reactions,
    ...(block ? { legendaryActions: { actions: block.actions } } : {}),
  }
  return listDirectSpellCastingSources(sections).filter((source) =>
    sourceHasSelectedSpell(values, source),
  )
}

export function legendaryReferenceTargets(values: MonsterFormValues): MonsterActionDraftRow[] {
  return listActionReferenceAcquisitionTargets((values.actions ?? []) as MonsterActionDraftRow[])
}

export function legendaryActionAcquisitionItems(
  values: MonsterFormValues,
  ctx: Pick<ContentFormCtx, 'spellCatalogStatus'>,
): ButtonDropdownItem[] {
  const targets = legendaryReferenceTargets(values)
  const sources = legendarySpellcastingSources(values)
  const catalogReady = ctx.spellCatalogStatus === 'ready'
  const items: AcquisitionOption[] = [
    {
      id: LEGENDARY_ACQUISITION_OPTION_ID.reference,
      label: MONSTER_ACTION_REFERENCE_ACQUISITION_LABEL,
      groupId: 'existing',
      description: {
        status: 'ready',
        text: MONSTER_ACTION_KIND_ENTRIES['action-reference'].description,
      },
      availability: resolveAcquisitionAvailability({
        prerequisite:
          targets.length === 0 ? { message: LEGENDARY_REFERENCE_DISABLED_NOTE } : undefined,
      }),
    },
    {
      id: LEGENDARY_ACQUISITION_OPTION_ID.spellcasting,
      label: LEGENDARY_ACTION_CATEGORY_LABELS.spellcasting,
      groupId: 'existing',
      description: { status: 'ready', text: LEGENDARY_SPELLCASTING_DESCRIPTION },
      availability: resolveAcquisitionAvailability({
        prerequisite:
          sources.length === 0 ? { message: LEGENDARY_SPELLCASTING_DISABLED_NOTE } : undefined,
      }),
    },
    {
      id: LEGENDARY_ACQUISITION_OPTION_ID['cast-spell'],
      label: LEGENDARY_CAST_SPELL_LABEL,
      groupId: 'new',
      description: { status: 'ready', text: LEGENDARY_CAST_SPELL_DESCRIPTION },
      availability: resolveAcquisitionAvailability({
        readiness: !catalogReady ? { message: LEGENDARY_CAST_SPELL_DISABLED_NOTE } : undefined,
      }),
    },
    {
      id: 'create:save',
      label: getMonsterActionKindLabel('save'),
      groupId: 'new',
      description: { status: 'ready', text: MONSTER_ACTION_KIND_ENTRIES.save.description },
      availability: { status: 'available' },
    },
    {
      id: 'create:special',
      label: LEGENDARY_CUSTOM_LABEL,
      groupId: 'new',
      description: { status: 'ready', text: LEGENDARY_CUSTOM_DESCRIPTION },
      availability: { status: 'available' },
    },
  ]
  return items.map(toAcquisitionDropdownItem)
}

export function createLegendaryActionDraft(
  category: LegendaryAcquisitionCategory,
  values: MonsterFormValues,
): MonsterActionDraftRow {
  const id = createMonsterRowId()
  switch (category) {
    case 'reference': {
      const targets = legendaryReferenceTargets(values)
      return {
        id,
        kind: 'action-reference',
        actionIds: targets.length === 1 && targets[0] ? [targets[0].id] : [],
      }
    }
    case 'spellcasting': {
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
    case 'cast-spell': {
      const cast = createSpellActionDraft('legendaryActions', values, 'standalone')
      if (cast.kind !== 'spell') return cast
      return {
        ...cast,
        name: LEGENDARY_CAST_SPELL_DEFAULT_NAME,
        spells: [{ spellId: undefined }],
      }
    }
    default: {
      const unreachable: never = category
      throw new Error(`Unknown legendary acquisition category: ${unreachable}`)
    }
  }
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
