import { NavLink } from 'react-router-dom'

import { cn, Heading } from '@rpg/ui'

import { BENCH_NAV_ITEMS } from '@/app/routes'

export function Sidebar() {
  return (
    <aside className="flex w-50 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center px-6">
        <Heading variant="brand" as="span">
          Dev Bench
        </Heading>
      </div>
      <nav aria-label="Dev Bench" className="flex flex-col gap-1 px-3 pb-6">
        {BENCH_NAV_ITEMS.map(({ to, label, end }) => (
          <NavLink
            key={to}
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
        ))}
      </nav>
    </aside>
  )
}
