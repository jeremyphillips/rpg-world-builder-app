'use client'

import * as React from 'react'
import { Castle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, Text } from '@rpg/ui'

import type { CampaignDisplayVM } from '../lib/campaign-display'
import {
  campaignDisplayNameIconVariants,
  campaignDisplayNameListLinkVariants,
  campaignDisplayNameListVariants,
  campaignDisplayNameTextVariants,
  type CampaignDisplayListSurface,
} from './campaign-display-name.variants'

export type CampaignDisplayNameListProps = {
  displays: readonly CampaignDisplayVM[]
  surface?: CampaignDisplayListSurface
  className?: string
  getHref: (display: CampaignDisplayVM) => string
  suffix?: React.ReactNode
}

/** One campaign icon with comma-separated linked names — `inlineMuted` list layout. */
export function CampaignDisplayNameList({
  displays,
  surface = 'inlineMuted',
  className,
  getHref,
  suffix,
}: CampaignDisplayNameListProps) {
  if (displays.length === 0) return null

  return (
    <span className={cn(campaignDisplayNameListVariants({ surface }), className)}>
      <Castle aria-hidden className={campaignDisplayNameIconVariants({ surface })} />
      <span className="inline-flex min-w-0 flex-wrap items-center">
        {displays.map((display, index) => (
          <span key={display.id}>
            {index > 0 ? ', ' : null}
            <Link
              to={getHref(display)}
              className={campaignDisplayNameListLinkVariants({ surface })}
            >
              <Text as="span" className={campaignDisplayNameTextVariants({ surface })}>
                {display.name || display.id}
              </Text>
            </Link>
          </span>
        ))}
        {suffix}
      </span>
    </span>
  )
}
