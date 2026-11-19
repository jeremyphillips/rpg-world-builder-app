import { RulesPreview } from '@rpg/ui'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../../../lib/forms/registry/content-form-registry'
import { findMonsterFormActionDraft } from '../../../../lib/actions/previews/monster-action-attack-summary'
import { buildMonsterActionSpellPreview } from '../../../../lib/actions/previews/monster-action-spell-summary'
import type { MonsterActionSection } from '../../../../lib/actions/references/monster-action-equipment-references'
import {
  MONSTER_ACTION_SPELL_PREVIEW_LABEL,
  MONSTER_REACTION_PREVIEW_LABEL,
} from '../../../../lib/monster-form-labels'
import type { MonsterActionDraftRow } from '../../../../lib/actions/monster-action-presets'
import { useMonsterActionPreviewTitle } from '../../../../lib/monster-qualified-preview-title'
import type { MonsterFormValues } from '../../../../lib/monster-form-values'

export function MonsterActionSpellSummary({
  ctx,
  action,
  section,
}: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
  section: MonsterActionSection
}) {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const preview = useMemo(() => {
    if (!values || action.kind !== 'spell') return null
    const draft = findMonsterFormActionDraft(values, ctx, action.id)
    const unavailableContext =
      draft && draft.kind === 'spell' ? { ctx, values, action: draft } : undefined
    return buildMonsterActionSpellPreview({
      values,
      ctx,
      actionId: action.id,
      section,
      unavailableContext,
    })
  }, [action.id, action.kind, ctx, section, values])

  const draft = values ? findMonsterFormActionDraft(values, ctx, action.id) : undefined
  const title = useMonsterActionPreviewTitle(draft, values, ctx, section)

  if (!preview) return null

  const label =
    section === 'reactions' ? MONSTER_REACTION_PREVIEW_LABEL : MONSTER_ACTION_SPELL_PREVIEW_LABEL

  if (preview.status === 'unavailable') {
    return (
      <RulesPreview
        label={label}
        title={title}
        content={{ kind: 'guidance', message: preview.guidance }}
      />
    )
  }

  return (
    <RulesPreview label={label} title={title} content={{ kind: 'html', html: preview.bodyHtml }} />
  )
}
