import {
  formatMonsterShapeShift,
  joinNaturalList,
  resolveCreatureFormsContext,
} from '@rpg/contracts'
import { movementRowsToRecordForPreview } from '../../../../lib/forms/fields/content-movement-form-fields'
import { RulesPreview } from '@rpg/ui'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { findMonsterFormActionDraft } from '../../../lib/actions/previews/monster-action-attack-summary'
import type { MonsterActionDraftRow } from '../../../lib/actions/monster-action-presets'
import {
  MONSTER_SHAPE_SHIFT_DESTINATIONS_LABEL,
  MONSTER_SHAPE_SHIFT_PREVIEW_LABEL,
  MONSTER_SHAPE_SHIFT_REQUIRES_ALTERNATE_FORM_NOTE,
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

    const context = resolveCreatureFormsContext(values.forms, values.name)
    if (context.status !== 'complete') {
      return {
        destinations: '',
        preview: 'Select the true form to preview Shape-Shift.',
      }
    }
    if (context.alternateDestinations.length === 0) {
      return {
        destinations: '',
        preview: MONSTER_SHAPE_SHIFT_REQUIRES_ALTERNATE_FORM_NOTE,
      }
    }
    const destinationNames = context.alternateDestinations.map(
      (form) => form.name || 'Untitled form',
    )
    const baseMovement = movementRowsToRecordForPreview(values.movement ?? [])
    const preview = formatMonsterShapeShift({
      monsterName: values.name,
      baseSizes: values.sizes ?? [],
      baseMovement,
      baseHover: values.hover,
      forms: values.forms,
      equipment: draft.equipment,
      prerequisite: draft.prerequisite,
      description: draft.description,
      hasShapeShift: true,
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
