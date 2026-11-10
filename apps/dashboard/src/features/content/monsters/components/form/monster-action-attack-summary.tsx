import { MONSTER_ACTION_ATTACK_KINDS } from '@rpg/contracts'
import { RulesPreview, Text } from '@rpg/ui'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  buildMonsterActionAttackPreview,
  resolveMonsterFormActionAttackProfile,
} from '../../lib/actions/monster-action-attack-summary'
import { MONSTER_ACTION_ATTACK_PREVIEW_LABEL } from '../../lib/monster-form-labels'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import type { MonsterFormValues } from '../../lib/monster-form-values'

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
    return buildMonsterActionAttackPreview(
      resolveMonsterFormActionAttackProfile(values, ctx, action.id),
      values.abilityScores,
    )
  }, [action.id, action.kind, ctx, values])

  if (!preview) return null

  if (preview.status === 'unavailable') {
    return (
      <Text as="p" variant="supporting">
        {preview.message}
      </Text>
    )
  }

  return (
    <RulesPreview
      label={MONSTER_ACTION_ATTACK_PREVIEW_LABEL}
      context={preview.modeCaption}
      content={{ kind: 'metadata', rows: preview.rows }}
    />
  )
}
