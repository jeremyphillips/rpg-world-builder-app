import { useMemo } from 'react'

import type { ContentFormCtx } from '../../../../../lib/forms/registry/content-form-registry'
import { buildMonsterActionMultiattackPreview } from '../../../../lib/actions/previews/monster-action-multiattack-summary'
import {
  MonsterActionRulesPreview,
  MonsterActionUnavailableRulesPreview,
} from '../../../../lib/actions/previews/monster-action-preview-presentation'
import { useMonsterActionPreviewContext } from '../../../../lib/actions/previews/use-monster-action-preview-context'
import { MONSTER_ACTION_MULTIATTACK_PREVIEW_LABEL } from '../../../../lib/monster-form-labels'
import type { MonsterActionDraftRow } from '../../../../lib/actions/monster-action-presets'

export function MonsterActionMultiattackSummary({
  ctx,
  action,
}: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
}) {
  const { values, draft, title } = useMonsterActionPreviewContext(ctx, action, 'actions')
  const preview = useMemo(() => {
    if (!values || action.kind !== 'multiattack') return null
    const unavailableContext =
      draft && draft.kind === 'multiattack' ? { ctx, values, action: draft } : undefined
    return buildMonsterActionMultiattackPreview({
      values,
      ctx,
      actionId: action.id,
      unavailableContext,
    })
  }, [action.id, action.kind, ctx, draft, values])

  if (!preview) return null

  if (preview.status === 'unavailable') {
    return (
      <MonsterActionUnavailableRulesPreview
        label={MONSTER_ACTION_MULTIATTACK_PREVIEW_LABEL}
        title={title}
        guidance={preview.guidance}
      />
    )
  }

  return (
    <MonsterActionRulesPreview
      label={MONSTER_ACTION_MULTIATTACK_PREVIEW_LABEL}
      title={title}
      content={{ kind: 'prose', text: preview.prose }}
    />
  )
}
