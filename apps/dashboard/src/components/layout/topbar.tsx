import { ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { getAssetUrl } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import {
  Avatar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarTrigger,
  ThemeSwitch,
} from '@rpg/ui'

import { useSession, useLogout } from '@/features/auth'

interface TopbarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function Topbar({ sidebarOpen, onToggleSidebar }: TopbarProps) {
  const { data: user } = useSession()
  const logout = useLogout()
  const navigate = useNavigate()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger isOpen={sidebarOpen} onClick={onToggleSidebar} className="md:hidden" />
        <h1 className="text-base font-semibold tracking-tight">Dashboard</h1>
      </div>

      {user ? (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <Avatar
              name={user.displayName}
              src={user.avatarKey ? getAssetUrl(user.avatarKey) : undefined}
              size="sm"
            />
            <span className="max-w-[160px] truncate font-medium">{user.displayName}</span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={() => navigate(ROUTES.profile)}>Profile</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate(ROUTES.account)}>
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <ThemeSwitch />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => logout.mutate()}
              disabled={logout.isPending}
              className="text-destructive focus:text-destructive"
            >
              {logout.isPending ? 'Signing out…' : 'Sign out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </header>
  )
}
