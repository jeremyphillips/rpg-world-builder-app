import * as React from 'react'
import { Sheet, dialogPanelActionRowClasses } from '@rpg/ui'

import { drawerShellBodyVariants } from './drawer-shell.variants'

export type DrawerShellBodyMode = 'scrolling' | 'managed' | 'composed'

export type DrawerShellProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  children: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
  /**
   * scrolling — shell body owns overflow-y scroll (informational / custom content).
   * managed — shell body is a non-scrolling flex column; child owns scrolling and footer.
   * composed — children render under Content (no auto Body); Form supplies Body + Footer.
   */
  bodyMode?: DrawerShellBodyMode
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
        {...(!description ? { 'aria-describedby': undefined } : {})}
      >
        <Sheet.Header headline={title} description={description} />
        {bodyMode === 'composed' ? (
          children
        ) : (
          <>
            <Sheet.Body className={drawerShellBodyVariants({ mode: bodyMode })}>
              {children}
            </Sheet.Body>
            {footer ? (
              <Sheet.Footer>
                <div className={dialogPanelActionRowClasses}>{footer}</div>
              </Sheet.Footer>
            ) : null}
          </>
        )}
      </Sheet.Content>
    </Sheet.Root>
  )
}

DrawerShell.Close = Sheet.Close
DrawerShell.Body = Sheet.Body
DrawerShell.Footer = Sheet.Footer
