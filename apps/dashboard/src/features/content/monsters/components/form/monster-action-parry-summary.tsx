import { RulesPreview } from '@rpg/ui'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { buildMonsterActionParryPreview } from '../../lib/actions/monster-action-parry-summary'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import { MONSTER_REACTION_PREVIEW_LABEL } from '../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../lib/monster-form-values'

export function MonsterActionParrySummary({
  ctx,
  action,
}: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
}) {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const preview = useMemo(() => {
    if (!values || action.kind !== 'parry') return null
    const draft = (values.reactions ?? []).find((row) => row.id === action.id)
    if (!draft || draft.kind !== 'parry') return null
    return buildMonsterActionParryPreview({ values, ctx, action: draft })
  }, [action.id, action.kind, ctx, values])

  if (!preview) return null

  return (
    <RulesPreview
      label={MONSTER_REACTION_PREVIEW_LABEL}
      content={{ kind: 'html', html: preview.bodyHtml }}
    />
  )
}
