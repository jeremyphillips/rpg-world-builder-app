import { RulesPreview } from '@rpg/ui'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { buildMonsterActionBonusPreview } from '../../lib/actions/monster-action-bonus-summary'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import { MONSTER_BONUS_ACTION_PREVIEW_LABEL } from '../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../lib/monster-form-values'

const BONUS_PREVIEW_KINDS = new Set(['leap', 'teleport', 'take-actions'])

export function MonsterActionBonusSummary({
  action,
}: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
}) {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const preview = useMemo(() => {
    if (!values || !BONUS_PREVIEW_KINDS.has(action.kind)) return null
    const draft = (values.bonusActions ?? []).find((row) => row.id === action.id)
    if (!draft || typeof draft.kind !== 'string' || !BONUS_PREVIEW_KINDS.has(draft.kind)) {
      return null
    }
    return buildMonsterActionBonusPreview({
      values,
      action: draft as Extract<
        MonsterActionDraftRow,
        { kind: 'leap' | 'teleport' | 'take-actions' }
      >,
    })
  }, [action.id, action.kind, values])

  if (!preview) return null

  return (
    <RulesPreview
      label={MONSTER_BONUS_ACTION_PREVIEW_LABEL}
      content={{ kind: 'html', html: preview.bodyHtml }}
    />
  )
}
