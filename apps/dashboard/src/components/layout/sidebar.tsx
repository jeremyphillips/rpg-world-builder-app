import { NavLink } from 'react-router-dom'

import { cn } from '@rpg/ui'

import { CampaignSwitcher } from '@/features/campaign'

const NAV_ITEMS = [{ to: '/', label: 'Overview', end: true }] as const

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center px-6">
        <span className="text-lg font-semibold tracking-tight">RPG World Builder</span>
      </div>
      {/* Global (non-campaign) navigation lives above the switcher. */}
      <nav className="flex flex-col gap-1 px-3 py-2" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      {/* The switcher is a context boundary: items below it are campaign-scoped. */}
      <div className="my-2 border-t border-border" />
      <div className="px-3 py-2">
        <CampaignSwitcher />
      </div>
    </aside>
  )
}
