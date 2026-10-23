import { NavLink, useLocation } from 'react-router-dom'

import { Icon, sidebarNavItemVariants, type IconName } from '@rpg/ui'

import { matchSidebarNavHref } from './lib/match-sidebar-nav-href'
import type { SidebarNavItem } from './lib/sidebar-nav-model'

export interface NavItemProps {
  to: string
  label: string
  icon: IconName
  end?: boolean
  isActive?: SidebarNavItem['isActive']
}

export function NavItem({ to, label, icon, end, isActive: isActiveOverride }: NavItemProps) {
  const { pathname } = useLocation()
  const item: SidebarNavItem = {
    id: to,
    label,
    href: to,
    end,
    isActive: isActiveOverride,
    icon,
  }

  return (
    <NavLink
      to={to}
      end={end}
      className={() => sidebarNavItemVariants({ active: matchSidebarNavHref(pathname, item) })}
      aria-current={matchSidebarNavHref(pathname, item) ? 'page' : undefined}
    >
      <Icon name={icon} size="owner" />
      {label}
    </NavLink>
  )
}
