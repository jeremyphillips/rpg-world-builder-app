import { MONSTER_ACTION_ATTACK_KINDS } from '@rpg/contracts'
import {
  Eyebrow,
  EmphasisDetailLine,
  MetadataList,
  Panel,
  Text,
  type MetadataListItem,
} from '@rpg/ui'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  buildMonsterActionAttackPreview,
  resolveMonsterFormActionAttackProfile,
  type MonsterActionAttackPreviewRow,
} from '../../lib/actions/monster-action-attack-summary'
import { MONSTER_ACTION_ATTACK_PREVIEW_LABEL } from '../../lib/monster-form-labels'
import type { MonsterActionDraftRow } from '../../lib/actions/monster-action-presets'
import type { MonsterFormValues } from '../../lib/monster-form-values'

const ATTACK_PREVIEW_KINDS: readonly string[] = MONSTER_ACTION_ATTACK_KINDS

function previewRowValue(row: MonsterActionAttackPreviewRow) {
  if (!row.secondary) return row.primary
  return <EmphasisDetailLine as="span" primary={row.primary} secondary={row.secondary} />
}

function toMetadataItems(rows: readonly MonsterActionAttackPreviewRow[]): MetadataListItem[] {
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    value: previewRowValue(row),
  }))
}

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
    <Panel tone="subtle" density="compact">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <Eyebrow size="sm">{MONSTER_ACTION_ATTACK_PREVIEW_LABEL}</Eyebrow>
          <Text as="span" variant="supporting">
            {preview.modeCaption}
          </Text>
        </div>
        <MetadataList
          size="sm"
          columnGap="sm"
          valueTrack="fill"
          emphasis="value"
          divider={false}
          items={toMetadataItems(preview.rows)}
        />
      </div>
    </Panel>
  )
}
