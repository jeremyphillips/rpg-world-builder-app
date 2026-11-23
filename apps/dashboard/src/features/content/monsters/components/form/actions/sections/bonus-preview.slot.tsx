import type { MonsterBonusActionDraft } from '@rpg/contracts'
import { useMemo } from 'react'

import type { ContentFormCtx } from '../../../../../lib/forms/registry/content-form-registry'
import { buildMonsterActionBonusPreview } from '../../../../lib/actions/previews/monster-action-bonus-summary'
import { MonsterActionRulesPreview } from '../../../../lib/actions/previews/monster-action-preview-presentation'
import { useMonsterActionPreviewContext } from '../../../../lib/actions/previews/use-monster-action-preview-context'
import type { MonsterActionDraftRow } from '../../../../lib/actions/monster-action-presets'
const BONUS_PREVIEW_KINDS = new Set(['leap', 'teleport', 'take-actions'])

export function MonsterActionBonusSummary({
  ctx,
  action,
}: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
}) {
  const { values, draft, title } = useMonsterActionPreviewContext(ctx, action, 'bonusActions')
  const preview = useMemo(() => {
    if (!values || !BONUS_PREVIEW_KINDS.has(action.kind)) return null
    if (!draft || typeof draft.kind !== 'string' || !BONUS_PREVIEW_KINDS.has(draft.kind)) {
      return null
    }
    return buildMonsterActionBonusPreview({
      values,
      action: draft as MonsterBonusActionDraft,
    })
  }, [action.kind, draft, values])

  if (!preview) return null

  return (
    <MonsterActionRulesPreview title={title} content={{ kind: 'html', html: preview.bodyHtml }} />
  )
}
