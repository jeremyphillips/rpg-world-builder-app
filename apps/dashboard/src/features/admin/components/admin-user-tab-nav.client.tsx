'use client'

import { NavLink } from 'react-router-dom'
import { PLATFORM_ROLE_ENTRIES } from '@rpg/contracts'
import { cn, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { useAdminUserRouteContext } from '../lib/admin-user-route-context'

function tabLinkClass(isActive: boolean) {
  return cn(
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-accent text-accent-foreground'
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
  )
}

export function AdminUserTabNav() {
  const { user } = useAdminUserRouteContext()
  const campaignTotal =
    user.campaignCounts.owned + user.campaignCounts.coOwned + user.campaignCounts.joined

  return (
    <nav aria-label="User sections" className="flex flex-wrap gap-1">
      <NavLink
        to={ROUTES.admin.user.detail(user.id)}
        end
        className={({ isActive }) => tabLinkClass(isActive)}
      >
        Overview
      </NavLink>
      <NavLink
        to={ROUTES.admin.user.campaigns(user.id)}
        className={({ isActive }) => tabLinkClass(isActive)}
      >
        Campaigns ({campaignTotal})
      </NavLink>
      <NavLink
        to={ROUTES.admin.user.characters(user.id)}
        className={({ isActive }) => tabLinkClass(isActive)}
      >
        Characters ({user.characterCount})
      </NavLink>
    </nav>
  )
}

export function AdminUserContextLine() {
  const { user } = useAdminUserRouteContext()

  return (
    <Text variant="muted" className="text-sm">
      {user.email} · {PLATFORM_ROLE_ENTRIES[user.platformRole].label}
    </Text>
  )
}
