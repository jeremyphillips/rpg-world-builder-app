import { MONSTER_ACTION_ATTACK_KINDS } from '@rpg/contracts'
import { RulesPreview } from '@rpg/ui'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import {
  buildMonsterActionAttackPreview,
  findMonsterFormActionDraft,
  resolveMonsterFormActionAttackProfile,
} from '../../../lib/actions/previews/monster-action-attack-summary'
import { MONSTER_ACTION_ATTACK_PREVIEW_LABEL } from '../../../lib/monster-form-labels'
import { useMonsterQualifiedPreviewTitle } from '../../../lib/monster-qualified-preview-title'
import type { MonsterActionDraftRow } from '../../../lib/actions/monster-action-presets'
import type { MonsterFormValues } from '../../../lib/monster-form-values'

const ATTACK_PREVIEW_KINDS: readonly string[] = MONSTER_ACTION_ATTACK_KINDS

export function MonsterActionAttackSummary({
  ctx,
  action,
}: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
}) {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const preview = useMemo(() => {
    if (!values || !ATTACK_PREVIEW_KINDS.includes(action.kind)) return null
    const draft = findMonsterFormActionDraft(values, ctx, action.id)
    const profile = resolveMonsterFormActionAttackProfile(values, ctx, action.id)
    const unavailableContext = draft ? { ctx, values, action: draft } : undefined
    return buildMonsterActionAttackPreview(
      profile,
      values.abilityScores,
      unavailableContext,
      values.name,
    )
  }, [action.id, action.kind, ctx, values])

  const draft = values ? findMonsterFormActionDraft(values, ctx, action.id) : undefined
  const title = useMonsterQualifiedPreviewTitle(draft)

  if (!preview) return null

  if (preview.status === 'unavailable') {
    return (
      <RulesPreview
        label={MONSTER_ACTION_ATTACK_PREVIEW_LABEL}
        title={title}
        content={{ kind: 'guidance', message: preview.guidance }}
      />
    )
  }

  return (
    <RulesPreview
      label={MONSTER_ACTION_ATTACK_PREVIEW_LABEL}
      title={title}
      context={preview.modeCaption}
      content={{ kind: 'metadata', rows: preview.rows }}
    />
  )
}
