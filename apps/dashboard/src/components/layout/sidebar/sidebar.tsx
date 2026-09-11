import { APP_NAME } from '@rpg/contracts'
import { Heading } from '@rpg/ui'

import { SidebarNav } from './sidebar-nav'
import {
  sidebarAsideVariants,
  sidebarBrandClasses,
  sidebarOverlayVariants,
} from './sidebar.variants'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={sidebarOverlayVariants({ open: isOpen })}
        aria-hidden="true"
        onClick={onClose}
      />

      <aside className={sidebarAsideVariants({ open: isOpen })}>
        <div className={sidebarBrandClasses}>
          <Heading variant="brand" as="span">
            {APP_NAME}
          </Heading>
        </div>
        <SidebarNav />
      </aside>
    </>
  )
}
