import type { ReactNode } from 'react'

import { Button, type ButtonProps } from '@rpg/ui'

export type EquipmentInventorySourceActionButtonProps = ButtonProps & {
  children: ReactNode
}

/** Compact ghost action for per-source release/remove inventory rows. */
export function EquipmentInventorySourceActionButton({
  children,
  variant = 'ghost',
  size = 'sm',
  density = 'compact',
  ...props
}: EquipmentInventorySourceActionButtonProps) {
  return (
    <Button type="button" variant={variant} size={size} density={density} {...props}>
      {children}
    </Button>
  )
}
