import { NavLink, useLocation } from 'react-router-dom'

import { cn } from '@rpg/ui'

export interface NavItemProps {
  to: string
  label: string
  end?: boolean
  isActive?: (pathname: string) => boolean
}

export function NavItem({ to, label, end, isActive: isActiveOverride }: NavItemProps) {
  const { pathname } = useLocation()

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => {
        const active = isActiveOverride ? isActiveOverride(pathname) : isActive
        return cn(
          'rounded-md px-3 py-2 text-sm font-medium transition-colors',
          active
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )
      }}
    >
      {label}
    </NavLink>
  )
}
