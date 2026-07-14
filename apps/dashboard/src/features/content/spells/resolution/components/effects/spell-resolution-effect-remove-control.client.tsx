'use client'

import { Button } from '@rpg/ui'
import { useArrayFieldContext } from '@rpg/ui/form'
import { Trash2 } from 'lucide-react'

import { useResolutionEditorContext } from '../../hooks/use-resolution-change-confirm.client'
import type { ResolutionEffectFormItem } from '../../lib/form/resolution-form-schema'

/** Per-effect remove control that routes through resolution change confirmation. */
export function SpellResolutionEffectRemoveControl() {
  const arrayContext = useArrayFieldContext()
  const { requestResolutionChange } = useResolutionEditorContext()

  if (!arrayContext) return null

  const effect = arrayContext.items[arrayContext.rowIndex] as ResolutionEffectFormItem | undefined
  const effectId = effect?.id
  if (!effectId) return null

  return (
    <div className="flex justify-end">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="size-8 shrink-0 p-0"
        aria-label={`Remove ${effectId} effect`}
        onClick={() => requestResolutionChange({ field: 'removeEffect', effectId })}
      >
        <Trash2 className="size-4" aria-hidden />
      </Button>
    </div>
  )
}
