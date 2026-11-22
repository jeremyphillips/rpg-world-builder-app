import type { MonsterActionDraft } from '@rpg/contracts'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { useMonsterActionRulesPreviewTitle } from '../../presentation/use-monster-action-rules-preview'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import type { MonsterActionSection } from '../references/monster-action-equipment-references'
import type { MonsterFormValues } from '../../monster-form-values'
import { findMonsterFormActionDraft } from './monster-action-draft-lookup'

export type MonsterActionPreviewContext = {
  values: MonsterFormValues | undefined
  draft: MonsterActionDraft | undefined
  title: string
}

/** Shared form subscription, draft lookup, and preview heading for action preview slots. */
export function useMonsterActionPreviewContext(
  ctx: ContentFormCtx,
  action: MonsterActionDraftRow,
  section: MonsterActionSection,
): MonsterActionPreviewContext {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const draft = useMemo(
    () => (values ? findMonsterFormActionDraft(values, ctx, action.id) : undefined),
    [action.id, ctx, values],
  )
  const title = useMonsterActionRulesPreviewTitle(ctx, action, values, section)
  return { values, draft, title }
}
