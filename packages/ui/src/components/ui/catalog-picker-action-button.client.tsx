'use client'

import { Button, type ButtonProps } from './button.client'
import { Icon } from './icon/icon'

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
  tabIndex?: number
}

/** Shared picker header action chrome — outline, sm, compact density (not overridable). */
export function CatalogPickerActionButton({
  children,
  intent,
  disabled,
  onClick,
  variant = 'outline',
  className,
  tabIndex,
}: CatalogPickerActionButtonProps) {
  const iconName = intent === 'remove' ? 'minus' : 'plus'

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      density="compact"
      className={className}
      disabled={disabled}
      tabIndex={tabIndex}
      onClick={onClick}
    >
      {CATALOG_PICKER_ROW_ACTION_ICONS ? <Icon name={iconName} size="owner" /> : null}
      {children}
    </Button>
  )
}
