import { MONSTER_ACTION_ATTACK_KINDS } from '@rpg/contracts'
import { useMemo } from 'react'

import type { ContentFormCtx } from '../../../../../lib/forms/registry/content-form-registry'
import {
  buildMonsterActionAttackPreview,
  resolveMonsterFormActionAttackProfile,
} from '../../../../lib/actions/previews/monster-action-attack-summary'
import {
  MonsterActionRulesPreview,
  MonsterActionUnavailableRulesPreview,
} from '../../../../lib/actions/previews/monster-action-preview-presentation'
import { useMonsterActionPreviewContext } from '../../../../lib/actions/previews/use-monster-action-preview-context'
import { MONSTER_ACTION_ATTACK_PREVIEW_LABEL } from '../../../../lib/monster-form-labels'
import type { MonsterActionDraftRow } from '../../../../lib/actions/monster-action-presets'

const ATTACK_PREVIEW_KINDS: readonly string[] = MONSTER_ACTION_ATTACK_KINDS

export function MonsterActionAttackSummary({
  ctx,
  action,
}: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
}) {
  const { values, draft, title } = useMonsterActionPreviewContext(ctx, action, 'actions')
  const preview = useMemo(() => {
    if (!values || !ATTACK_PREVIEW_KINDS.includes(action.kind)) return null
    const profile = resolveMonsterFormActionAttackProfile(values, ctx, action.id)
    const unavailableContext = draft ? { ctx, values, action: draft } : undefined
    return buildMonsterActionAttackPreview(
      profile,
      values.abilityScores,
      unavailableContext,
      values.name,
    )
  }, [action.id, action.kind, ctx, draft, values])

  if (!preview) return null

  if (preview.status === 'unavailable') {
    return (
      <MonsterActionUnavailableRulesPreview
        label={MONSTER_ACTION_ATTACK_PREVIEW_LABEL}
        title={title}
        guidance={preview.guidance}
      />
    )
  }

  return (
    <MonsterActionRulesPreview
      label={MONSTER_ACTION_ATTACK_PREVIEW_LABEL}
      title={title}
      context={preview.modeCaption}
      content={{ kind: 'metadata', rows: preview.rows }}
    />
  )
}
