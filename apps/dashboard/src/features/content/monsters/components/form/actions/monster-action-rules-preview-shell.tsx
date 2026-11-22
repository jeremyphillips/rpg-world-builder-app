import { useMemo, type ReactNode } from 'react'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { MetadataList, Panel, Eyebrow, Text } from '@rpg/ui'

import { MonsterActionUnavailableRulesPreview } from '../../../lib/actions/previews/monster-action-preview-presentation'
import { useMonsterActionPreviewTitle } from '../../../lib/monster-qualified-preview-title'
import type { MonsterActionDraftRow } from '../../../lib/actions/monster-action-presets'
import type { MonsterActionSection } from '../../../lib/actions/references/monster-action-equipment-references'
import {
  MONSTER_ACTION_PREVIEW_LABEL,
  MONSTER_SHAPE_SHIFT_DESTINATIONS_LABEL,
} from '../../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../../lib/monster-form-values'
import {
  monsterActionAttackPreviewMetadataRows,
  monsterActionAttackPreviewModeCaption,
} from '../../../lib/presentation/monster-action-attack-preview-metadata'
import { monsterActionShapeShiftDestinationsProse } from '../../../lib/presentation/monster-action-shape-shift-destinations'
import { resolveActionStatBlockRulesFacingForForm } from '../../../lib/presentation/resolve-action-stat-block-rules-facing-for-form'
import { MonsterActionRulesBody } from '../../detail/monster-action-rules-body'

function MonsterActionReadyPreview({
  label,
  title,
  context,
  children,
}: {
  label: string
  title?: string
  context?: string
  children: ReactNode
}) {
  return (
    <Panel tone="subtle" density="compact">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <Eyebrow size="sm">{label}</Eyebrow>
        {context ? (
          <Text as="span" variant="supporting">
            {context}
          </Text>
        ) : null}
      </div>
      {title ? (
        <Text variant="emphasis" className="mb-0.5">
          {title}
        </Text>
      ) : null}
      <div className="flex flex-col gap-1">{children}</div>
    </Panel>
  )
}

// fallow-ignore-next-line complexity
export function MonsterActionRulesPreviewShell({
  ctx,
  action,
  section,
  values,
}: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
  section: MonsterActionSection
  values: MonsterFormValues
}) {
  const editorTitle = useMonsterActionPreviewTitle(action, values, ctx, section)
  const outcome = useMemo(
    () =>
      resolveActionStatBlockRulesFacingForForm({
        values,
        ctx,
        actionId: action.id,
        section,
      }),
    [action.id, ctx, section, values],
  )

  const shapeShiftDestinations =
    action.kind === 'shape-shift' ? monsterActionShapeShiftDestinationsProse(values) : undefined

  const title = outcome.status === 'ready' ? outcome.facing.name : editorTitle || undefined

  if (outcome.status !== 'ready') {
    return (
      <MonsterActionUnavailableRulesPreview
        label={MONSTER_ACTION_PREVIEW_LABEL}
        title={title}
        guidance={outcome.guidance}
      />
    )
  }

  const sourceName = values.name?.trim() || 'Creature'
  const modeCaption = outcome.attackProfile
    ? monsterActionAttackPreviewModeCaption(outcome.attackProfile, values, sourceName)
    : undefined
  const metadataRows = outcome.attackProfile
    ? monsterActionAttackPreviewMetadataRows(outcome.attackProfile, values, sourceName)
    : []

  const hasRulesProse = Boolean(outcome.facing.rulesProse && outcome.facing.rulesProse.length > 0)
  const hasDescription =
    outcome.facing.descriptionHtml && outcome.facing.descriptionHtml.trim().length > 0

  if (hasRulesProse || hasDescription) {
    return (
      <>
        <MonsterActionReadyPreview
          label={MONSTER_ACTION_PREVIEW_LABEL}
          title={title}
          context={modeCaption}
        >
          <MonsterActionRulesBody item={outcome.facing} />
          {metadataRows.length > 0 ? (
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
          ) : null}
        </MonsterActionReadyPreview>
        {shapeShiftDestinations ? (
          <Text variant="supporting">
            <Text as="span" variant="label">
              {MONSTER_SHAPE_SHIFT_DESTINATIONS_LABEL}:{' '}
            </Text>
            {shapeShiftDestinations}
          </Text>
        ) : null}
      </>
    )
  }

  return (
    <>
      <MonsterActionReadyPreview label={MONSTER_ACTION_PREVIEW_LABEL} title={title}>
        {outcome.facing.attackLine ? (
          <Text variant="body-compact">{outcome.facing.attackLine}</Text>
        ) : null}
      </MonsterActionReadyPreview>
      {shapeShiftDestinations ? (
        <Text variant="supporting">
          <Text as="span" variant="label">
            {MONSTER_SHAPE_SHIFT_DESTINATIONS_LABEL}:{' '}
          </Text>
          {shapeShiftDestinations}
        </Text>
      ) : null}
    </>
  )
}
