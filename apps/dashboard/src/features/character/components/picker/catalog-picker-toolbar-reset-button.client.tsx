'use client'

import { RotateCcw } from 'lucide-react'

import { Button } from '@rpg/ui'

import { catalogPickerToolbarResetButtonClasses } from './catalog-picker-filter-toolbar.variants'

export type CatalogPickerToolbarResetButtonProps = {
  label: string
  onClick: () => void
}

export function CatalogPickerToolbarResetButton({
  label,
  onClick,
}: CatalogPickerToolbarResetButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={catalogPickerToolbarResetButtonClasses}
      onClick={onClick}
    >
      <RotateCcw aria-hidden className="size-3" />
      {label}
    </Button>
  )
}
