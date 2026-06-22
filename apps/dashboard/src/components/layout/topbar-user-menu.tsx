import { ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { getAssetUrl, type SessionUser } from '@rpg/contracts'
import {
  Avatar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ThemeSwitch,
} from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { useLogout } from '@/features/auth'

interface TopbarUserMenuProps {
  user: SessionUser
}

export function TopbarUserMenu({ user }: TopbarUserMenuProps) {
  const logout = useLogout()
  const navigate = useNavigate()

  return (
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
  )
}
