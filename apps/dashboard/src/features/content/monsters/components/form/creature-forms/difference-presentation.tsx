import { useMemo } from 'react'
import {
  analyzeCreatureFormDifferences,
  FORM_DIFFERENCES_PRESENTATION,
  FORM_DIFFERENCES_PRESENTATION_ENTRIES,
  shapeShiftRows,
  type FormDifferencesPresentation,
} from '@rpg/contracts'
import { Alert } from '@rpg/ui'
import { FormItems, toOptions } from '@rpg/ui/form'
import { useWatch } from 'react-hook-form'

import { movementRowsToRecordForPreview } from '../../../../lib/forms/fields/content-movement-form-fields'
import type { MonsterFormValues } from '../../../lib/monster-form-values'
import {
  MONSTER_FORM_DIFFERENCES_FALLBACK_NOTE,
  MONSTER_FORM_DIFFERENCES_LABEL,
} from '../../../lib/monster-form-labels'
import { normalizeMonsterDraftForPreview } from '../../../lib/normalize-monster-form-values'

const FORM_DIFFERENCES_PRESENTATION_LABELS = {
  'stat-rows': FORM_DIFFERENCES_PRESENTATION_ENTRIES['stat-rows'].label,
  'transformation-description':
    FORM_DIFFERENCES_PRESENTATION_ENTRIES['transformation-description'].label,
} as const satisfies Record<FormDifferencesPresentation, string>

export function MonsterFormsDifferencePresentation() {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const view = useMemo(() => {
    if (!values?.forms) return { visible: false as const }
    const movement = movementRowsToRecordForPreview(values.movement ?? [])
    const analysis = analyzeCreatureFormDifferences({
      sizes: values.sizes ?? [],
      movement,
      hover: values.hover,
      forms: values.forms,
      monsterName: values.name,
    })
    if (!analysis?.movementDiffers && !analysis?.speechDiffers) return { visible: false as const }
    const monster = normalizeMonsterDraftForPreview(values, { intent: 'draft', mode: 'create' })
    const hasShapeShift = shapeShiftRows(monster).length > 0
    const showFallback =
      values.forms.differencesPresentation === 'transformation-description' && !hasShapeShift
    return { visible: true as const, showFallback }
  }, [values])

  if (!view.visible) return null

  return (
    <div className="space-y-2">
      <FormItems
        idPrefix="forms-differences"
        items={[
          {
            type: 'radio',
            name: 'forms.differencesPresentation',
            label: MONSTER_FORM_DIFFERENCES_LABEL,
            options: toOptions(FORM_DIFFERENCES_PRESENTATION, FORM_DIFFERENCES_PRESENTATION_LABELS),
          },
        ]}
      />
      {view.showFallback ? (
        <Alert variant="info" title={MONSTER_FORM_DIFFERENCES_FALLBACK_NOTE} />
      ) : null}
    </div>
  )
}
