'use client'

import type { ReactNode } from 'react'

import { cn, Heading, Text } from '@rpg/ui'

import {
  detailSectionPanelBodyVariants,
  detailSectionPanelHeaderRowVariants,
  detailSectionPanelHeaderVariants,
  detailSectionPanelVariants,
} from './detail-section-panel.variants'

export type DetailSectionPanelProps = {
  heading: string
  headingId: string
  helper?: string
  headingAs?: 'h2' | 'h3'
  headerEndSlot?: ReactNode
  children: ReactNode
  className?: string
}

export function DetailSectionPanel({
  heading,
  headingId,
  helper,
  headingAs = 'h2',
  headerEndSlot,
  children,
  className,
}: DetailSectionPanelProps) {
  return (
    <section className={cn(detailSectionPanelVariants(), className)} aria-labelledby={headingId}>
      <div className={detailSectionPanelHeaderVariants()}>
        <div className={detailSectionPanelHeaderRowVariants()}>
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
          {headerEndSlot ? <div className="shrink-0">{headerEndSlot}</div> : null}
        </div>
      </div>
      <div className={detailSectionPanelBodyVariants()}>{children}</div>
    </section>
  )
}
