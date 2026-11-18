import {
  formatMonsterQualifiedHeading,
  MONSTER_UNTITLED_FORM_LABEL,
  monsterFormRestrictionEligibleIds,
  resolveCreatureFormsContext,
  resolveMonsterEntryHeading,
  type CreatureFormsDraft,
} from '@rpg/contracts'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { monsterActionEditorTitles } from './actions/monster-action-editor-title'
import { monsterFormSectionRows } from './actions/monster-action-section-access'
import type { MonsterActionDraftRow } from './actions/monster-action-presets'
import type { MonsterActionSection } from './actions/references/monster-action-equipment-references'
import { monsterTraitPreviewBaseName } from './traits/monster-trait-editor-title'
import type { MonsterFormValues } from './monster-form-values'

export function monsterFormRestrictionLabels(
  forms: CreatureFormsDraft,
  creatureName: string,
): Map<string, string> {
  const eligibleIds = new Set(monsterFormRestrictionEligibleIds(forms))
  const names = new Map<string, string>()
  const context = resolveCreatureFormsContext(forms, creatureName)
  if (context.status === 'invalid') return names

  const register = (id: string, label: string) => {
    if (eligibleIds.has(id)) names.set(id, label.trim() || MONSTER_UNTITLED_FORM_LABEL)
  }

  if (context.profile?.id) register(context.profile.id, context.profile.name)
  for (const form of context.definedForms) {
    register(form.id, form.name)
  }
  return names
}

function readOnlyInFormIds(row: unknown): readonly string[] | undefined {
  if (!row || typeof row !== 'object' || !('onlyInFormIds' in row)) return undefined
  const ids = (row as { onlyInFormIds?: unknown }).onlyInFormIds
  if (!Array.isArray(ids)) return undefined
  return ids.filter((id): id is string => typeof id === 'string')
}

/** Preview heading. Limited use stays on the stat block. */
export function formatMonsterEntryPreviewTitle(
  name: string,
  onlyInFormIds: readonly string[] | undefined,
  forms: CreatureFormsDraft | undefined,
  creatureName: string,
): string {
  const heading = resolveMonsterEntryHeading({
    name,
    onlyInFormIds,
    forms,
    creatureName,
  })
  return formatMonsterQualifiedHeading(heading.name, { formQualifier: heading.formQualifier })
}

export function useMonsterEntryPreviewTitle(name: string, row: unknown): string {
  const forms = useWatch<MonsterFormValues, 'forms'>({ name: 'forms' })
  const creatureName = useWatch<MonsterFormValues, 'name'>({ name: 'name' })
  return useMemo(
    () => formatMonsterEntryPreviewTitle(name, readOnlyInFormIds(row), forms, creatureName ?? ''),
    [creatureName, forms, name, row],
  )
}

export function useMonsterActionPreviewTitle(
  draft: MonsterActionDraftRow | undefined,
  values: MonsterFormValues | undefined,
  ctx: ContentFormCtx,
  section: MonsterActionSection,
): string {
  const name = useMemo(() => {
    if (!draft) return ''
    return (
      monsterActionEditorTitles(monsterFormSectionRows(values, section), values, ctx, section).get(
        draft.id,
      ) ?? ''
    )
  }, [ctx, draft, section, values])
  return useMonsterEntryPreviewTitle(name, draft)
}

export function useMonsterTraitPreviewTitle(row: unknown): string {
  const creatureName = useWatch<MonsterFormValues, 'name'>({ name: 'name' })
  const traits = useWatch<MonsterFormValues, 'traits'>({ name: 'traits' })
  const name = useMemo(
    () => monsterTraitPreviewBaseName(row, creatureName ?? '', traits ?? []),
    [creatureName, row, traits],
  )
  return useMonsterEntryPreviewTitle(name, row)
}
