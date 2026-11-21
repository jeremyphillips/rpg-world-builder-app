import {
  type CreatureFormsDraft,
  formatMonsterQualifiedHeading,
  resolveMonsterEntryHeading,
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

function readOnlyInFormIds(row: unknown): readonly string[] | undefined {
  if (!row || typeof row !== 'object' || !('onlyInFormIds' in row)) return undefined
  const ids = (row as { onlyInFormIds?: unknown }).onlyInFormIds
  if (!Array.isArray(ids)) return undefined
  return ids.filter((id): id is string => typeof id === 'string')
}

/** Action rules-preview heading — trait previews use `resolveTraitStatBlockRulesFacingForFormRow`. */
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
