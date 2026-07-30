import { Castle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, Text } from '@rpg/ui'

import type { CampaignDisplayVM } from '../lib/campaign-display'
import {
  campaignDisplayNameIconVariants,
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

/** Presentational campaign identity — icon or image plus name for a given surface. */
export function CampaignDisplayName({
  display,
  surface,
  href,
  asLink = false,
  className,
}: CampaignDisplayNameProps) {
  const content = (
    <>
      {display.imageUrl ? (
        <img
          src={display.imageUrl}
          alt=""
          className={cn(campaignDisplayNameIconVariants({ surface }), 'rounded-sm object-cover')}
        />
      ) : (
        <Castle aria-hidden className={campaignDisplayNameIconVariants({ surface })} />
      )}
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
