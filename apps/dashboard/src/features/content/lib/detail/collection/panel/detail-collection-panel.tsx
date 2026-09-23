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
  /** Leading square icon container shown before the heading stack. */
  icon?: ReactNode
  /** Vertical alignment of the header row contents. */
  headerAlign?: 'start' | 'center'
  /** Header surface treatment — subtle for connection section chrome. */
  headerSurface?: 'card' | 'subtle'
  /** Body surface treatment — transparent for bordered list rows without card fill. */
  bodySurface?: 'subtle' | 'transparent'
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
  icon,
  headerAlign = 'start',
  headerSurface = 'card',
  bodySurface = 'subtle',
  action,
  children,
  className,
}: DetailCollectionPanelProps) {
  return (
    <section className={cn(detailCollectionPanelVariants(), className)} aria-labelledby={headingId}>
      <div className={detailCollectionPanelHeaderVariants({ surface: headerSurface })}>
        <div className={detailCollectionPanelHeaderRowVariants({ align: headerAlign })}>
          <div className="flex min-w-0 items-center gap-3">
            {icon ? <div className="shrink-0">{icon}</div> : null}
            <div className="min-w-0 space-y-1">
              <Heading variant="label" as={headingAs} id={headingId}>
                {heading}
              </Heading>
              {helper ? <Text variant="muted">{helper}</Text> : null}
            </div>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
      <div className={detailCollectionPanelBodyVariants({ surface: bodySurface })}>{children}</div>
    </section>
  )
}
