import Link from 'next/link'

import { buttonVariants, Heading, Text } from '@rpg/ui'

import { ROUTES } from '@/lib/routes'

import { PRIMARY_CTA_LABEL } from './landing-content'
import { landingCtaPanelClasses, landingCtaSectionClasses } from './landing-cta.variants'
import { ScrollReveal } from './scroll-reveal.client'

export function LandingCta() {
  return (
    <section aria-labelledby="landing-cta-heading" className={landingCtaSectionClasses}>
      <ScrollReveal>
        <div className={landingCtaPanelClasses}>
          <Heading variant="section" as="h2" id="landing-cta-heading" className="text-balance">
            Your next campaign starts here
          </Heading>
          <Text variant="lead" as="p" className="max-w-xl text-pretty">
            Create an account, found your first campaign, and have a world worth exploring before
            your next session zero.
          </Text>
          <Link href={ROUTES.signup} className={buttonVariants({ size: 'lg' })}>
            {PRIMARY_CTA_LABEL}
          </Link>
        </div>
      </ScrollReveal>
    </section>
  )
}
