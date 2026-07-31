import { SidebarTrigger, cn } from '@rpg/ui'

import { useSession } from '@/features/auth'
import { NotificationBellMenu } from '@/features/notification'

import { appShellHorizontalPaddingClasses } from './app-shell.variants'
import { TopbarTitleSlot } from './topbar-title-slot'
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
        'flex h-12 items-center gap-3 border-b border-border',
        appShellHorizontalPaddingClasses,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <SidebarTrigger
          isOpen={sidebarOpen}
          onClick={onToggleSidebar}
          className="shrink-0 md:hidden"
        />
        <TopbarTitleSlot />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {user ? <NotificationBellMenu /> : null}
        {user ? <TopbarUserMenu user={user} /> : null}
      </div>
    </header>
  )
}
