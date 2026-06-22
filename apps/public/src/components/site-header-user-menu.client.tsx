'use client'

import { ChevronDown } from 'lucide-react'

import {
  CROSS_APP_PATHS,
  crossAppCampaignDetailPath,
  getAssetUrl,
  type ActiveCampaign,
  type SessionUser,
} from '@rpg/contracts'
import {
  Avatar,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
