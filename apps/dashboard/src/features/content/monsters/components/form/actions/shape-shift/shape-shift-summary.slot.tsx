import { RulesPreview } from '@rpg/ui'
import { useMemo } from 'react'

import type { ContentFormCtx } from '../../../../../lib/forms/registry/content-form-registry'
import { buildMonsterActionShapeShiftPreview } from '../../../../lib/actions/previews/monster-action-shape-shift-summary'
import type { MonsterActionDraftRow } from '../../../../lib/actions/monster-action-presets'
import {
  MONSTER_SHAPE_SHIFT_DESTINATIONS_LABEL,
  MONSTER_SHAPE_SHIFT_PREVIEW_LABEL,
} from '../../../../lib/monster-form-labels'
import { useMonsterActionPreviewContext } from '../../../../lib/actions/previews/use-monster-action-preview-context'

export function MonsterActionShapeShiftSummary({
  ctx,
  action,
}: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
}) {
  const { values } = useMonsterActionPreviewContext(ctx, action, 'bonusActions')
  const summary = useMemo(() => {
    if (!values || action.kind !== 'shape-shift') return null
    return buildMonsterActionShapeShiftPreview({ values, ctx, actionId: action.id })
  }, [action.id, action.kind, ctx, values])

  if (!summary) return null

  return (
    <>
      <RulesPreview
        label={MONSTER_SHAPE_SHIFT_DESTINATIONS_LABEL}
        content={{ kind: 'prose', text: summary.destinationsProse }}
      />
      <RulesPreview
        label={MONSTER_SHAPE_SHIFT_PREVIEW_LABEL}
        content={{ kind: 'prose', text: summary.rulesProse }}
      />
    </>
  )
}
