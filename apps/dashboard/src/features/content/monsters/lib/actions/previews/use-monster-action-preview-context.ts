import type { MonsterActionDraft } from '@rpg/contracts'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { useMonsterActionPreviewTitle } from '../../monster-qualified-preview-title'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import type { MonsterActionSection } from '../references/monster-action-equipment-references'
import type { MonsterFormValues } from '../../monster-form-values'
import { findMonsterFormActionDraft } from './monster-action-attack-summary'

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
  const title = useMonsterActionPreviewTitle(
    draft as MonsterActionDraftRow | undefined,
    values,
    ctx,
    section,
  )
  return { values, draft, title }
}
