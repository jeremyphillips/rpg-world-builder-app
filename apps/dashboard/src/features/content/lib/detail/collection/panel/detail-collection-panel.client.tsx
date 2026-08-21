'use client'

import type { ReactNode } from 'react'

import { cn, Heading, Text } from '@rpg/ui'

import {
  detailCollectionPanelBodyVariants,
  detailCollectionPanelHeaderRowVariants,
  detailCollectionPanelHeaderVariants,
  detailCollectionPanelVariants,
} from './detail-collection-panel.variants'

export type DetailCollectionPanelProps = {
  heading: string
  headingId: string
  helper?: string
  headingAs?: 'h2' | 'h3'
  /** Single optional panel-header action control (button, menu, link-button). */
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function DetailCollectionPanel({
  heading,
  headingId,
  helper,
  headingAs = 'h2',
  action,
  children,
  className,
}: DetailCollectionPanelProps) {
  return (
    <section className={cn(detailCollectionPanelVariants(), className)} aria-labelledby={headingId}>
      <div className={detailCollectionPanelHeaderVariants()}>
        <div className={detailCollectionPanelHeaderRowVariants()}>
          <div className="min-w-0 space-y-1">
            <Heading variant="label" as={headingAs} id={headingId}>
              {heading}
            </Heading>
            {helper ? (
              <Text variant="muted" className="text-sm">
                {helper}
              </Text>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
      <div className={detailCollectionPanelBodyVariants()}>{children}</div>
    </section>
  )
}
