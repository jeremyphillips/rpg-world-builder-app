import type { ReactNode } from 'react'

import { Heading } from '@rpg/ui'

export interface PageHeaderProps {
  heading: string
  /** Optional inline badges beside the heading (e.g. source, status). */
  badge?: ReactNode
  /** Optional toolbar actions (e.g. "New" link) rendered on the right. */
  actions?: ReactNode
}

/** Page title row with optional actions — composes inside PageShell. */
export function PageHeader({ heading, badge, actions }: PageHeaderProps) {
  return (
    <div className={actions ? 'flex items-center justify-between gap-4' : undefined}>
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <Heading variant="page" as="h1">
          {heading}
        </Heading>
        {badge}
      </div>
      {actions}
    </div>
  )
}
