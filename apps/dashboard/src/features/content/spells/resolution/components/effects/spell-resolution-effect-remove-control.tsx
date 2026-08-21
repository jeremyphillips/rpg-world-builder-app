import { outcomeApplicationsReferenceEffect } from '@rpg/contracts'
import { ArrayItemRemoveButton, useArrayFieldContext } from '@rpg/ui/form'
import { useWatch } from 'react-hook-form'

import { formatEffectRowPrimary } from '../../../lib/effects/effect-display'
import { useResolutionEditorContext } from '../../hooks/use-resolution-change-confirm'
import type {
  ResolutionEffectFormItem,
  ResolutionFormValues,
} from '../../lib/form/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'

/** Per-effect header remove control that routes through resolution change confirmation. */
export function SpellResolutionEffectRemoveControl() {
  const arrayContext = useArrayFieldContext()
  const { requestResolutionChange } = useResolutionEditorContext()
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined

  if (!arrayContext) return null

  const effect = arrayContext.items[arrayContext.rowIndex] as ResolutionEffectFormItem | undefined
  const effectId = effect?.id
  if (!effectId) return null

  const label = formatEffectRowPrimary(effect, arrayContext.rowIndex)

  return (
    <ArrayItemRemoveButton
      ariaLabel={`Remove ${label}`}
      canRemove
      onRemove={() => {
        if (!outcomeApplicationsReferenceEffect(resolution?.outcomes, effectId)) {
          arrayContext.removeItem?.()
          return
        }

        requestResolutionChange({ field: 'removeEffect', effectId })
      }}
    />
  )
}
