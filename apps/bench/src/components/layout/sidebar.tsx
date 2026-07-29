import { Heading } from '@rpg/ui'

import { BenchSidebarNav } from './bench-sidebar-nav'

export function Sidebar() {
  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center px-6">
        <Heading variant="brand" as="span">
          Dev Bench
        </Heading>
      </div>
      <BenchSidebarNav />
    </aside>
  )
}
