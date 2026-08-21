import { Link } from 'react-router-dom'
import { buttonVariants, Heading, Text } from '@rpg/ui'

import { PageHeader } from '@/components/layout/page/page-header'
import { WidePage } from '@/components/layout/page/wide-page'
import { ROUTES } from '@/app/routes'

import { HomebrewDetailMain } from './homebrew-detail-main'

export type HomebrewDetailFallbackStatus = 'unknown' | 'disabled'

export type HomebrewDetailFallbackProps = {
  status: HomebrewDetailFallbackStatus
  heading: string
  message: string
  /** Required when `status` is `'unknown'` — renders the hub back link. */
  campaignId?: string
}

/**
 * Hub detail fallback copy.
 *
 * - `unknown` — full-page fallback (invalid or unrecognized IDs).
 * - `disabled` — inline body for a known registry entry; compose inside
 *   {@link HomebrewDetailShell} so hub nav stays visible.
 */
export function HomebrewDetailFallback({
  status,
  heading,
  message,
  campaignId,
}: HomebrewDetailFallbackProps) {
  const body = (
    <>
      <PageHeader heading={heading} />
      {status === 'disabled' ? (
        <Heading variant="section" as="h2">
          Not available yet
        </Heading>
      ) : null}
      <Text variant="muted">{message}</Text>
      {status === 'unknown' && campaignId ? (
        <Link
          to={ROUTES.homebrew.hub(campaignId)}
          className={buttonVariants({ variant: 'outline' })}
        >
          Back to Homebrew
        </Link>
      ) : null}
    </>
  )

  if (status === 'unknown') {
    return <WidePage spacing="relaxed">{body}</WidePage>
  }

  return <HomebrewDetailMain>{body}</HomebrewDetailMain>
}
