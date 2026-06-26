import { useNavigate } from 'react-router-dom'

import { type SessionUser } from '@rpg/contracts'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  ThemeSwitch,
  UserMenuTrigger,
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
      <UserMenuTrigger displayName={user.displayName} avatarKey={user.avatarKey} />
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
