import { Card, CardContent, CardDescription, CardHeader, Heading } from '@rpg/ui'

import { LANDING_FEATURES } from './landing-content'
import {
  LANDING_FEATURE_STAGGER_MS,
  landingFeatureCardClasses,
  landingFeatureGridClasses,
  landingFeatureIconTileClasses,
} from './landing-features.variants'
import { LandingSection } from './landing-section'
import { ScrollReveal } from './scroll-reveal.client'

export function LandingFeatures() {
  return (
    <LandingSection
      id="features"
      surface="muted"
      eyebrow="Everything in one workspace"
      heading="Tools for every part of your table"
      description="From the first campaign pitch to the last boss fight — author, organize, and run it all without leaving the dashboard."
    >
      <ul className={landingFeatureGridClasses}>
        {LANDING_FEATURES.map((feature, index) => (
          <li key={feature.title}>
            <ScrollReveal
              delayMs={index * LANDING_FEATURE_STAGGER_MS}
              className={landingFeatureCardClasses}
            >
              <Card className={landingFeatureCardClasses}>
                <CardHeader>
                  <div aria-hidden className={landingFeatureIconTileClasses}>
                    <feature.icon />
                  </div>
                  <Heading variant="card" as="h3" className="pt-2">
                    {feature.title}
                  </Heading>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-pretty">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </ScrollReveal>
          </li>
        ))}
      </ul>
    </LandingSection>
  )
}
