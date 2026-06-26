'use client'

import {
  CROSS_APP_PATHS,
  crossAppCampaignDetailPath,
  type ActiveCampaign,
  type SessionUser,
} from '@rpg/contracts'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  UserMenuTrigger,
} from '@rpg/ui'

import { useLogout } from '@/features/auth'

interface SiteHeaderUserMenuProps {
  user: SessionUser
  activeCampaign: ActiveCampaign | null
}

export function SiteHeaderUserMenu({ user, activeCampaign }: SiteHeaderUserMenuProps) {
  const logout = useLogout()

  return (
    <DropdownMenu modal={false}>
      <UserMenuTrigger displayName={user.displayName} avatarKey={user.avatarKey} />
      <DropdownMenuContent align="end" className="w-48">
        {activeCampaign ? (
          <>
            <DropdownMenuLabel>Active campaign</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <a href={crossAppCampaignDetailPath(activeCampaign.id)}>{activeCampaign.name}</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem asChild>
          <a href={CROSS_APP_PATHS.dashboard}>Dashboard</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={CROSS_APP_PATHS.dashboardProfile}>Profile</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={CROSS_APP_PATHS.dashboardAccount}>Account Settings</a>
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
