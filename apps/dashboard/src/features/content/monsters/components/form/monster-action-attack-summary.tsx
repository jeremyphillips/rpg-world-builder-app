import { MONSTER_ACTION_ATTACK_KIND_SET } from '@rpg/contracts'
import { useMemo } from 'react'
import { Text } from '@rpg/ui'
import { useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  describeMonsterActionAttackProfile,
  resolveMonsterFormActionAttackProfile,
} from '../../lib/actions/monster-action-attack-summary'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import type { MonsterFormValues } from '../../lib/monster-form-values'

const ATTACK_KINDS = MONSTER_ACTION_ATTACK_KIND_SET

export function MonsterActionAttackSummary({
  ctx,
  action,
}: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
}) {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const lines = useMemo(() => {
    if (!values || !ATTACK_KINDS.has(action.kind)) return []
    return describeMonsterActionAttackProfile(
      resolveMonsterFormActionAttackProfile(values, ctx, action.id),
    )
  }, [action.id, action.kind, ctx, values])

  if (lines.length === 0) return null
  return (
    <div className="flex flex-col gap-1">
      {lines.map((line) => (
        <Text key={line} as="p" variant="supporting">
          {line}
        </Text>
      ))}
    </div>
  )
}
