import { useMemo } from 'react'

import type { ContentFormCtx } from '../../../../../lib/forms/registry/content-form-registry'
import { buildMonsterActionSpellPreview } from '../../../../lib/actions/previews/monster-action-spell-summary'
import {
  MonsterActionRulesPreview,
  MonsterActionUnavailableRulesPreview,
} from '../../../../lib/actions/previews/monster-action-preview-presentation'
import { useMonsterActionPreviewContext } from '../../../../lib/actions/previews/use-monster-action-preview-context'
import type { MonsterActionSection } from '../../../../lib/actions/references/monster-action-equipment-references'
import {
  MONSTER_ACTION_SPELL_PREVIEW_LABEL,
  MONSTER_REACTION_PREVIEW_LABEL,
} from '../../../../lib/monster-form-labels'
import type { MonsterActionDraftRow } from '../../../../lib/actions/monster-action-presets'

export function MonsterActionSpellSummary({
  ctx,
  action,
  section,
}: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
  section: MonsterActionSection
}) {
  const { values, draft, title } = useMonsterActionPreviewContext(ctx, action, section)
  const preview = useMemo(() => {
    if (!values || action.kind !== 'spell') return null
    const unavailableContext =
      draft && draft.kind === 'spell' ? { ctx, values, action: draft } : undefined
    return buildMonsterActionSpellPreview({
      values,
      ctx,
      actionId: action.id,
      section,
      unavailableContext,
    })
  }, [action.id, action.kind, ctx, draft, section, values])

  if (!preview) return null

  const label =
    section === 'reactions' ? MONSTER_REACTION_PREVIEW_LABEL : MONSTER_ACTION_SPELL_PREVIEW_LABEL

  if (preview.status === 'unavailable') {
    return (
      <MonsterActionUnavailableRulesPreview
        label={label}
        title={title}
        guidance={preview.guidance}
      />
    )
  }

  return (
    <MonsterActionRulesPreview
      label={label}
      title={title}
      content={{ kind: 'html', html: preview.bodyHtml }}
    />
  )
}
