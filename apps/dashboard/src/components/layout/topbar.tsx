import { Button, SidebarTrigger } from '@rpg/ui'

import { useSession, useLogout } from '@/features/auth'

interface TopbarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function Topbar({ sidebarOpen, onToggleSidebar }: TopbarProps) {
  const { data: user } = useSession()
  const logout = useLogout()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger isOpen={sidebarOpen} onClick={onToggleSidebar} className="md:hidden" />
        <h1 className="text-base font-semibold tracking-tight">Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <span className="text-sm text-muted-foreground">
            {user.displayName}
            {user.role !== 'user' && (
              <>
                {' '}
                · <span className="capitalize">{user.role}</span>
              </>
            )}
          </span>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          {logout.isPending ? 'Logging out…' : 'Log out'}
        </Button>
      </div>
    </header>
  )
}
