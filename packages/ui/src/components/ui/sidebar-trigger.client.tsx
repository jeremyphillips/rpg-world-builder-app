'use client'

import { Menu, X } from 'lucide-react'

import { Button, type ButtonForwardingProps } from './button.client'

export interface SidebarTriggerProps extends Omit<ButtonForwardingProps, 'size' | 'variant'> {
  isOpen?: boolean
}

export function SidebarTrigger({ isOpen = false, ...props }: SidebarTriggerProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      aria-expanded={isOpen}
      {...props}
    >
      {isOpen ? <X /> : <Menu />}
    </Button>
  )
}
