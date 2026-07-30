import { NavLink } from 'react-router-dom'

import { sidebarNavItemVariants } from '@rpg/ui'

import type { BenchSidebarNavItem } from './lib/bench-sidebar-nav-model'

export function BenchNavItem({ item }: { item: BenchSidebarNavItem }) {
  return (
    <NavLink
      to={item.href}
      end={item.end}
      className={({ isActive }) => sidebarNavItemVariants({ active: isActive })}
    >
      {item.label}
    </NavLink>
  )
}
