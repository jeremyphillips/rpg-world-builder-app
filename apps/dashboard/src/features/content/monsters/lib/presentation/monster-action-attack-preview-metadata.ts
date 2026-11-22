import type { MonsterActionAttackProfile } from '@rpg/contracts'

import type { RulesPreviewMetadataRow } from '@rpg/ui'

import { buildMonsterActionAttackPreview } from '../actions/previews/monster-action-attack-summary'
import type { MonsterFormValues } from '../monster-form-values'

export function monsterActionAttackPreviewMetadataRows(
  profile: MonsterActionAttackProfile,
  values: MonsterFormValues | undefined,
  sourceName?: string,
): readonly RulesPreviewMetadataRow[] {
  const preview = buildMonsterActionAttackPreview(
    { status: 'resolved', value: profile },
    values?.abilityScores,
    undefined,
    sourceName,
  )
  if (preview.status !== 'ready') return []
  return preview.rows
}

export function monsterActionAttackPreviewModeCaption(
  profile: MonsterActionAttackProfile,
  values: MonsterFormValues | undefined,
  sourceName?: string,
): string | undefined {
  const preview = buildMonsterActionAttackPreview(
    { status: 'resolved', value: profile },
    values?.abilityScores,
    undefined,
    sourceName,
  )
  if (preview.status !== 'ready') return undefined
  return preview.modeCaption
}
