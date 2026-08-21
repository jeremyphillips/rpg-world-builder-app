'use client'

import { Button, type ButtonProps } from '@rpg/ui'

export type CatalogPickerActionButtonProps = {
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  density?: ButtonProps['density']
  className?: string
}

/** Shared picker header action chrome — outline by default, overridable per surface. */
export function CatalogPickerActionButton({
  children,
  disabled,
  onClick,
  variant = 'outline',
  size = 'sm',
  density = 'compact',
  className,
}: CatalogPickerActionButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      density={density}
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}
