'use client'

import { ChevronDown } from 'lucide-react'

import { getAssetUrl } from '@rpg/contracts'

import { Avatar } from './avatar.client'
import { DropdownMenuTrigger } from './dropdown-menu.client'

const userMenuTriggerClassName =
  'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export interface UserMenuTriggerProps {
  displayName: string
  avatarKey?: string
}

/** Shared account menu trigger for dashboard topbar and public site header. */
export function UserMenuTrigger({ displayName, avatarKey }: UserMenuTriggerProps) {
  return (
    <DropdownMenuTrigger className={userMenuTriggerClassName}>
      <Avatar name={displayName} src={avatarKey ? getAssetUrl(avatarKey) : undefined} size="sm" />
      <span className="max-w-[160px] truncate font-medium">{displayName}</span>
      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
    </DropdownMenuTrigger>
  )
}
