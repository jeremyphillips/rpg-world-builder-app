import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import type { MonsterActionDraftRow } from '../actions/monster-action-presets'
import type { MonsterActionSection } from '../actions/references/monster-action-equipment-references'
import { useMonsterActionPreviewTitle } from '../monster-qualified-preview-title'
import type { MonsterFormValues } from '../monster-form-values'

import { tryResolveActionStatBlockRulesFacingForForm } from './resolve-action-stat-block-rules-facing-for-form'
import type { MonsterActionRulesFacing } from './resolve-action-stat-block-rules-facing'

export function useMonsterActionRulesPreviewPresentation(
  ctx: ContentFormCtx,
  actionId: string,
  section: MonsterActionSection,
): MonsterActionRulesFacing | null {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  return useMemo(() => {
    if (!values) return null
    return tryResolveActionStatBlockRulesFacingForForm({
      values,
      ctx,
      actionId,
      section,
    })
  }, [actionId, ctx, section, values])
}

/** Stat-block heading for rules previews; falls back to editor chrome title when derivation is unavailable. */
export function useMonsterActionRulesPreviewTitle(
  ctx: ContentFormCtx,
  action: MonsterActionDraftRow,
  values: MonsterFormValues | undefined,
  section: MonsterActionSection,
): string {
  const editorTitle = useMonsterActionPreviewTitle(action, values, ctx, section)
  const facing = useMonsterActionRulesPreviewPresentation(ctx, action.id, section)
  return facing?.name ?? editorTitle
}
