'use client'

import { Minus, Plus } from 'lucide-react'

import { Button, type ButtonProps } from './button.client'

/** Flip to hide plus/minus glyphs on every picker row action. */
export const CATALOG_PICKER_ROW_ACTION_ICONS = true

export type CatalogPickerRowActionIntent = 'add' | 'remove'

export type CatalogPickerActionButtonProps = {
  children: React.ReactNode
  /** Add renders plus. Remove renders minus. */
  intent: CatalogPickerRowActionIntent
  disabled?: boolean
  onClick: () => void
  variant?: ButtonProps['variant']
  className?: string
}

/** Shared picker header action chrome — outline, sm, compact density (not overridable). */
export function CatalogPickerActionButton({
  children,
  intent,
  disabled,
  onClick,
  variant = 'outline',
  className,
}: CatalogPickerActionButtonProps) {
  const Icon = intent === 'remove' ? Minus : Plus

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      density="compact"
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
      {CATALOG_PICKER_ROW_ACTION_ICONS ? <Icon aria-hidden /> : null}
      {children}
    </Button>
  )
}
