import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { APP_NAME } from '@rpg/contracts'

import { Badge, buttonVariants, Heading, Text } from '@rpg/ui'

import { ROUTES } from '@/lib/routes'

import { HERO_CONTENT_TYPES, PRIMARY_CTA_LABEL, SECONDARY_CTA_LABEL } from './landing-content'
import {
  landingHeroContentTypeListClasses,
  landingHeroEnterVariants,
  landingHeroInnerClasses,
  landingHeroSectionClasses,
} from './landing-hero.variants'

export function LandingHero() {
  return (
    <section aria-labelledby="landing-hero-heading" className={landingHeroSectionClasses}>
      <div className={landingHeroInnerClasses}>
        <div className={landingHeroEnterVariants({ step: 0 })}>
          <Badge
            appearance="outline"
            tone="neutral"
            size="sm"
            leadingIcon={<Sparkles aria-hidden />}
          >
            The complete toolkit for game masters
          </Badge>
        </div>
        <Heading
          variant="display"
          as="h1"
          id="landing-hero-heading"
          className={landingHeroEnterVariants({ step: 1, className: 'text-balance' })}
        >
          Forge worlds your party will never forget
        </Heading>
        <Text
          variant="lead"
          as="p"
          className={landingHeroEnterVariants({ step: 2, className: 'max-w-xl text-pretty' })}
        >
          {APP_NAME} brings campaigns, homebrew content, characters, and rules together in one
          focused workspace — so prep time goes into creating, not organizing.
        </Text>
        <div
          className={landingHeroEnterVariants({
            step: 3,
            className: 'flex flex-wrap items-center justify-center gap-3',
          })}
        >
          <Link href={ROUTES.signup} className={buttonVariants({ size: 'lg' })}>
            {PRIMARY_CTA_LABEL}
          </Link>
          <Link href={ROUTES.login} className={buttonVariants({ variant: 'outline', size: 'lg' })}>
            {SECONDARY_CTA_LABEL}
          </Link>
        </div>
        <ul
          aria-label="Content you can author"
          className={landingHeroEnterVariants({
            step: 4,
            className: landingHeroContentTypeListClasses,
          })}
        >
          {HERO_CONTENT_TYPES.map((contentType) => (
            <li key={contentType}>
              <Badge appearance="soft" tone="neutral" size="sm">
                {contentType}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
