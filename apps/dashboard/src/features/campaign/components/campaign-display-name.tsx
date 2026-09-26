import { Castle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, IdentityFrame, Text } from '@rpg/ui'

import type { CampaignDisplayVM } from '../lib/campaign-display'
import {
  campaignDisplayNameTextVariants,
  campaignDisplayNameVariants,
  type CampaignDisplaySurface,
} from './campaign-display-name.variants'

export type CampaignDisplayNameProps = {
  display: CampaignDisplayVM
  surface: CampaignDisplaySurface
  href?: string
  asLink?: boolean
  className?: string
}

/** Presentational campaign identity — emblem or castle plus name for a given surface. */
export function CampaignDisplayName({
  display,
  surface,
  href,
  asLink = false,
  className,
}: CampaignDisplayNameProps) {
  const mark = (
    <IdentityFrame
      src={display.imageUrl ?? undefined}
      alt=""
      shape="box"
      size="inline"
      fit="contain"
      fallback={<Castle aria-hidden />}
    />
  )

  const content = (
    <>
      {mark}
      <Text as="span" className={campaignDisplayNameTextVariants({ surface })}>
        {display.name || display.id}
      </Text>
    </>
  )

  const rootClassName = cn(campaignDisplayNameVariants({ surface }), className)

  if (asLink && href) {
    return (
      <Link to={href} className={rootClassName}>
        {content}
      </Link>
    )
  }

  if (surface === 'page') {
    return <h1 className={rootClassName}>{content}</h1>
  }

  return <span className={rootClassName}>{content}</span>
}
