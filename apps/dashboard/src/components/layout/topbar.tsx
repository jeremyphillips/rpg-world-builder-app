import { SidebarTrigger, cn } from '@rpg/ui'

import { useSession } from '@/features/auth'

import { appShellHorizontalPaddingClasses } from './app-shell.variants'
import { TopbarUserMenu } from './topbar-user-menu'

interface TopbarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function Topbar({ sidebarOpen, onToggleSidebar }: TopbarProps) {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <header
      className={cn(
        'flex h-12 items-center justify-between border-b border-border',
        appShellHorizontalPaddingClasses,
      )}
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger isOpen={sidebarOpen} onClick={onToggleSidebar} className="md:hidden" />
      </div>

      {user ? <TopbarUserMenu user={user} /> : null}
    </header>
  )
}
