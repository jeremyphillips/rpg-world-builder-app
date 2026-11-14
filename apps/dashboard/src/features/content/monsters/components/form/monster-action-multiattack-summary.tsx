import { RulesPreview } from '@rpg/ui'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { findMonsterFormActionDraft } from '../../lib/actions/monster-action-attack-summary'
import { buildMonsterActionMultiattackPreview } from '../../lib/actions/monster-action-multiattack-summary'
import { MONSTER_ACTION_MULTIATTACK_PREVIEW_LABEL } from '../../lib/monster-form-labels'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import type { MonsterFormValues } from '../../lib/monster-form-values'

export function MonsterActionMultiattackSummary({
  ctx,
  action,
}: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
}) {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const preview = useMemo(() => {
    if (!values || action.kind !== 'multiattack') return null
    const draft = findMonsterFormActionDraft(values, ctx, action.id)
    const unavailableContext =
      draft && draft.kind === 'multiattack' ? { ctx, values, action: draft } : undefined
    return buildMonsterActionMultiattackPreview({
      values,
      ctx,
      actionId: action.id,
      unavailableContext,
    })
  }, [action.id, action.kind, ctx, values])

  if (!preview) return null

  if (preview.status === 'unavailable') {
    return (
      <RulesPreview
        label={MONSTER_ACTION_MULTIATTACK_PREVIEW_LABEL}
        content={{ kind: 'guidance', message: preview.guidance }}
      />
    )
  }

  return (
    <RulesPreview
      label={MONSTER_ACTION_MULTIATTACK_PREVIEW_LABEL}
      content={{ kind: 'prose', text: preview.prose }}
    />
  )
}
