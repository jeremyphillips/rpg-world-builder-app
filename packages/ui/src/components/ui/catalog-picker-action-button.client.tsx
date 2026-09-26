'use client'

import { Button, type ButtonProps } from './button.client'

export type CatalogPickerActionButtonProps = {
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
  variant?: ButtonProps['variant']
  className?: string
}

/** Shared picker header action chrome — outline, sm, compact density (not overridable). */
export function CatalogPickerActionButton({
  children,
  disabled,
  onClick,
  variant = 'outline',
  className,
}: CatalogPickerActionButtonProps) {
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
      {children}
    </Button>
  )
}
