import { NavLink } from 'react-router-dom'

import { cn } from '@rpg/ui'

import { CampaignSwitcher } from '@/features/campaign'

const NAV_ITEMS = [{ to: '/', label: 'Overview', end: true }] as const

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden="true"
        onClick={onClose}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col border-r border-border bg-card transition-transform md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
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
    </>
  )
}
