import type { LucideIcon } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

import { sidebarNavItemVariants } from '@rpg/ui'

import { matchSidebarNavHref } from './lib/match-sidebar-nav-href'
import type { SidebarNavItem } from './lib/sidebar-nav-model'

export interface NavItemProps {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  isActive?: SidebarNavItem['isActive']
}

export function NavItem({ to, label, icon: Icon, end, isActive: isActiveOverride }: NavItemProps) {
  const { pathname } = useLocation()
  const item: SidebarNavItem = {
    id: to,
    label,
    href: to,
    end,
    isActive: isActiveOverride,
    icon: Icon,
  }

  return (
    <NavLink
      to={to}
      end={end}
      className={() => sidebarNavItemVariants({ active: matchSidebarNavHref(pathname, item) })}
      aria-current={matchSidebarNavHref(pathname, item) ? 'page' : undefined}
    >
      <Icon className="size-4 shrink-0" size={16} strokeWidth={1.75} aria-hidden />
      {label}
    </NavLink>
  )
}
