import type { ReactNode } from 'react'

import { Button, type ButtonForwardingProps } from '@rpg/ui'

export type EquipmentInventorySourceActionButtonProps = ButtonForwardingProps & {
  children: ReactNode
}

/** Compact ghost action for per-source release/remove inventory rows. */
export function EquipmentInventorySourceActionButton({
  children,
  variant = 'ghost',
  size = 'xs',
  ...props
}: EquipmentInventorySourceActionButtonProps) {
  return (
    <Button type="button" variant={variant} size={size} {...props}>
      {children}
    </Button>
  )
}
