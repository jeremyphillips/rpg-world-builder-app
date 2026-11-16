import { formatMonsterShapeShift, joinNaturalList } from '@rpg/contracts'
import { RulesPreview } from '@rpg/ui'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { findMonsterFormActionDraft } from '../../../lib/actions/previews/monster-action-attack-summary'
import type { MonsterActionDraftRow } from '../../../lib/actions/monster-action-presets'
import {
  MONSTER_SHAPE_SHIFT_DESTINATIONS_LABEL,
  MONSTER_SHAPE_SHIFT_PREVIEW_LABEL,
} from '../../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../../lib/monster-form-values'

export function MonsterActionShapeShiftSummary({
  ctx,
  action,
}: {
  ctx: ContentFormCtx
  action: MonsterActionDraftRow
}) {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const summary = useMemo(() => {
    if (!values?.forms || action.kind !== 'shape-shift') return null
    const draft = findMonsterFormActionDraft(values, ctx, action.id)
    if (!draft || draft.kind !== 'shape-shift') return null

    const destinationNames = [
      ...values.forms.alternates.map((form) => form.name?.trim() || 'Untitled form'),
      values.forms.trueForm.name?.trim() || 'True form',
    ]
    const preview = formatMonsterShapeShift({
      monsterName: values.name,
      baseSizes: values.sizes ?? [],
      trueForm: values.forms.trueForm,
      alternates: values.forms.alternates,
      equipment: draft.equipment,
      prerequisite: draft.prerequisite,
      description: draft.description,
    })
    return { destinations: joinNaturalList(destinationNames), preview }
  }, [action.id, action.kind, ctx, values])

  if (!summary) return null

  return (
    <>
      <RulesPreview
        label={MONSTER_SHAPE_SHIFT_DESTINATIONS_LABEL}
        content={{ kind: 'prose', text: summary.destinations }}
      />
      <RulesPreview
        label={MONSTER_SHAPE_SHIFT_PREVIEW_LABEL}
        content={{ kind: 'prose', text: summary.preview }}
      />
    </>
  )
}
