import { APP_NAME } from '@rpg/contracts'
import { cn, Heading } from '@rpg/ui'

import { SidebarNav } from './sidebar-nav'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden="true"
        onClick={onClose}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[240px] shrink-0 flex-col border-r border-border bg-sidebar transition-transform md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center px-6">
          <Heading variant="brand" as="span">
            {APP_NAME}
          </Heading>
        </div>
        <SidebarNav />
      </aside>
    </>
  )
}
