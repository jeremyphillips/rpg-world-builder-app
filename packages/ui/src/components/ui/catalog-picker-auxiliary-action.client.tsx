'use client'

import { Plus } from 'lucide-react'

import { Button } from './button.client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu.client'
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
      ) : action.state === 'menu' ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              density="compact"
              disabled={action.disabled}
            >
              <Plus aria-hidden />
              {action.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {action.items.map((item) => (
              <DropdownMenuItem
                key={item.label}
                disabled={item.disabled}
                onSelect={() => item.onAction()}
              >
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
