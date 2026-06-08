import { NavLink } from 'react-router-dom'

import { cn } from '@rpg/ui'

export interface NavItemProps {
  to: string
  label: string
  end?: boolean
}

export function NavItem({ to, label, end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )
      }
    >
      {label}
    </NavLink>
  )
}
