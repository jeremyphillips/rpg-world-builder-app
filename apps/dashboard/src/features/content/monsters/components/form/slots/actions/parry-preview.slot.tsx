import { useMemo } from 'react'

import type { ContentFormCtx } from '../../../../../lib/forms/registry/content-form-registry'
import { buildMonsterActionParryPreview } from '../../../../lib/actions/previews/monster-action-parry-summary'
import { MonsterActionRulesPreview } from '../../../../lib/actions/previews/monster-action-preview-presentation'
import { useMonsterActionPreviewContext } from '../../../../lib/actions/previews/use-monster-action-preview-context'
import type { MonsterActionDraftRow } from '../../../../lib/actions/monster-action-presets'
import { MONSTER_REACTION_PREVIEW_LABEL } from '../../../../lib/monster-form-labels'

export function MonsterActionParrySummary({
  ctx,
  action,
}: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
}) {
  const { values, draft, title } = useMonsterActionPreviewContext(ctx, action, 'reactions')
  const preview = useMemo(() => {
    if (!values || action.kind !== 'parry' || !draft) return null
    return buildMonsterActionParryPreview({
      values,
      ctx,
      action: draft as unknown as Extract<MonsterActionDraftRow, { kind: 'parry' }>,
    })
  }, [action.kind, ctx, draft, values])

  if (!preview) return null

  return (
    <MonsterActionRulesPreview
      label={MONSTER_REACTION_PREVIEW_LABEL}
      title={title}
      content={{ kind: 'html', html: preview.bodyHtml }}
    />
  )
}
