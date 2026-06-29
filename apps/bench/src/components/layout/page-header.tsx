import type { ReactNode } from 'react'

import { Heading } from '@rpg/ui'

export interface PageHeaderProps {
  heading: string
  /** Optional toolbar actions (e.g. "New ticket") rendered on the right. */
  actions?: ReactNode
}

/** Page title row with optional actions. */
export function PageHeader({ heading, actions }: PageHeaderProps) {
  return (
    <div className={actions ? 'flex items-center justify-between gap-4' : undefined}>
      <Heading variant="page" as="h1">
        {heading}
      </Heading>
      {actions}
    </div>
  )
}
