'use client'

import * as React from 'react'
import { Sheet } from '@rpg/ui'

import { drawerShellBodyVariants } from './drawer-shell.variants'

export type DrawerShellProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  children: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
  /**
   * scrolling — shell body owns overflow-y scroll (informational / custom content).
   * managed — shell body is a non-scrolling flex column; child owns scrolling
   *           and footer docking (Form with stickyFooter + footerVariant="sheet").
   */
  bodyMode?: 'scrolling' | 'managed'
}

/** Canonical application drawer chrome — fixed 550px background surface. */
export function DrawerShell({
  open,
  onOpenChange,
  title,
  children,
  description,
  footer,
  bodyMode = 'scrolling',
}: DrawerShellProps) {
  return (
    <Sheet.Root open={open} onOpenChange={onOpenChange}>
      <Sheet.Content
        surface="background"
        size="lg"
        aria-describedby={description ? undefined : undefined}
      >
        <Sheet.Header headline={title} description={description} />
        <Sheet.Body className={drawerShellBodyVariants({ mode: bodyMode })}>{children}</Sheet.Body>
        {footer ? <Sheet.Footer>{footer}</Sheet.Footer> : null}
      </Sheet.Content>
    </Sheet.Root>
  )
}

DrawerShell.Close = Sheet.Close
