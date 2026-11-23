import { useMemo, type ReactNode } from 'react'
import { MetadataList, Text } from '@rpg/ui'

import type { ContentFormCtx } from '../lib/forms/registry/content-form-registry'
import {
  monsterActionAttackPreviewMetadataRows,
  monsterActionAttackPreviewModeCaption,
} from '../monsters/lib/presentation/monster-action-attack-preview-metadata'
import { monsterActionShapeShiftDestinationsProse } from '../monsters/lib/presentation/monster-action-shape-shift-destinations'
import { resolveActionStatBlockRulesFacingForForm } from '../monsters/lib/presentation/resolve-action-stat-block-rules-facing-for-form'
import type { MonsterActionDraftRow } from '../monsters/lib/actions/monster-action-presets'
import type { MonsterActionSection } from '../monsters/lib/actions/references/monster-action-equipment-references'
import { MONSTER_SHAPE_SHIFT_DESTINATIONS_LABEL } from '../monsters/lib/monster-form-labels'
import type { MonsterFormValues } from '../monsters/lib/monster-form-values'
import type { FacingHostConfig } from './facing-host-config.types'
import { resolveFacing } from './resolve-facing'

function attackMetadataTrailing(
  values: MonsterFormValues,
  actionId: string,
  section: MonsterActionSection,
  ctx: ContentFormCtx,
): ReactNode {
  const outcome = resolveActionStatBlockRulesFacingForForm({
    values,
    ctx,
    actionId,
    section,
  })
  if (outcome.status !== 'ready' || !outcome.attackProfile) return null
  const sourceName = values.name?.trim() || 'Creature'
  const metadataRows = monsterActionAttackPreviewMetadataRows(
    outcome.attackProfile,
    values,
    sourceName,
  )
  if (metadataRows.length === 0) return null
  return (
    <MetadataList
      size="sm"
      columnGap="sm"
      valueTrack="fill"
      emphasis="value"
      divider={false}
      items={metadataRows.map((row) => ({
        id: row.id,
        label: row.label,
        value: row.primary,
      }))}
    />
  )
}

function shapeShiftAdditional(action: MonsterActionDraftRow, values: MonsterFormValues): ReactNode {
  if (action.kind !== 'shape-shift') return null
  const prose = monsterActionShapeShiftDestinationsProse(values)
  if (!prose) return null
  return (
    <Text variant="supporting">
      <Text as="span" variant="label">
        {MONSTER_SHAPE_SHIFT_DESTINATIONS_LABEL}:{' '}
      </Text>
      {prose}
    </Text>
  )
}

export function useMonsterActionFacingHost(input: {
  ctx: ContentFormCtx
  values: MonsterFormValues | undefined
  action: MonsterActionDraftRow | undefined
  section: MonsterActionSection | undefined
}): FacingHostConfig | undefined {
  const { ctx, values, action, section } = input

  return useMemo((): FacingHostConfig | undefined => {
    if (!values || !action || !section || !action.id) return undefined

    const actionId = action.id
    const outcome = resolveActionStatBlockRulesFacingForForm({
      values,
      ctx,
      actionId,
      section,
    })
    const sourceName = values.name?.trim() || 'Creature'
    const modeCaption =
      outcome.status === 'ready' && outcome.attackProfile
        ? monsterActionAttackPreviewModeCaption(outcome.attackProfile, values, sourceName)
        : undefined

    const chromeTrailing = attackMetadataTrailing(values, actionId, section, ctx)

    return {
      hostId: 'monster-action-sections',
      resolveSelectedFacing: () =>
        resolveFacing({
          domain: 'monsterAction',
          source: 'draft',
          values,
          ctx,
          actionId,
          section,
        }),
      ...(modeCaption ? { context: modeCaption } : {}),
      ...(chromeTrailing ? { chromeTrailing } : {}),
    }
  }, [action, ctx, section, values])
}

export function monsterActionAdditionalDetails(
  action: MonsterActionDraftRow | undefined,
  values: MonsterFormValues | undefined,
): ReactNode {
  if (!action || !values) return null
  return shapeShiftAdditional(action, values)
}
