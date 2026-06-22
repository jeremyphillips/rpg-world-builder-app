import { Heading, SidebarTrigger } from '@rpg/ui'

import { useSession } from '@/features/auth'

import { TopbarUserMenu } from './topbar-user-menu'

interface TopbarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function Topbar({ sidebarOpen, onToggleSidebar }: TopbarProps) {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger isOpen={sidebarOpen} onClick={onToggleSidebar} className="md:hidden" />
        <Heading variant="nav" as="h1">
          Dashboard
        </Heading>
      </div>

      {user ? <TopbarUserMenu user={user} /> : null}
    </header>
  )
}
