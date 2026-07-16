'use client'

import { RotateCcw } from 'lucide-react'

import { Button } from '@rpg/ui'

import { catalogPickerToolbarResetButtonClasses } from './catalog-picker-filter-toolbar.variants'

export type CatalogPickerToolbarResetButtonProps = {
  label: string
  onClick: () => void
  tabIndex?: number
}

export function CatalogPickerToolbarResetButton({
  label,
  onClick,
  tabIndex,
}: CatalogPickerToolbarResetButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={catalogPickerToolbarResetButtonClasses}
      onClick={onClick}
      tabIndex={tabIndex}
    >
      <RotateCcw aria-hidden className="size-3" />
      {label}
    </Button>
  )
}

export type CatalogPickerToolbarResetSlotProps = {
  visible: boolean
  label: string
  onClick: () => void
}

/** Reserves toolbar space so the reset action does not shift sibling controls. */
export function CatalogPickerToolbarResetSlot({
  visible,
  label,
  onClick,
}: CatalogPickerToolbarResetSlotProps) {
  return (
    <div className={visible ? undefined : 'invisible'} aria-hidden={visible ? undefined : true}>
      <CatalogPickerToolbarResetButton
        label={label}
        onClick={onClick}
        tabIndex={visible ? undefined : -1}
      />
    </div>
  )
}
