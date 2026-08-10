'use client'

import { Plus } from 'lucide-react'

import { Button } from './button.client'
import { Text } from './text'
import type { CatalogPickerAuxiliaryAction } from './catalog-picker-sheet.types'
import { catalogPickerAuxiliaryActionRowVariants } from './catalog-picker-sheet.variants'

export type CatalogPickerAuxiliaryActionSlotProps = {
  action: CatalogPickerAuxiliaryAction
}

export function CatalogPickerAuxiliaryActionSlot({
  action,
}: CatalogPickerAuxiliaryActionSlotProps) {
  return (
    <div className={catalogPickerAuxiliaryActionRowVariants()}>
      {action.state === 'unavailable' ? (
        <Text variant="destructive" className="text-right text-sm">
          {action.message}
        </Text>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          density="compact"
          disabled={action.disabled}
          onClick={action.onAction}
        >
          <Plus aria-hidden />
          {action.label}
        </Button>
      )}
    </div>
  )
}
