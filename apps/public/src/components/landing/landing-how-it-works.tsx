import { Heading, Text } from '@rpg/ui'

import { HOW_IT_WORKS_STEPS } from './landing-content'
import {
  LANDING_STEP_STAGGER_MS,
  landingStepItemClasses,
  landingStepListClasses,
  landingStepNumberClasses,
} from './landing-how-it-works.variants'
import { LandingSection } from './landing-section'
import { ScrollReveal } from './scroll-reveal.client'

export function LandingHowItWorks() {
  return (
    <LandingSection
      id="how-it-works"
      surface="muted"
      eyebrow="From blank page to session one"
      heading="How it works"
      description="Three steps between you and your next great campaign."
    >
      <ol className={landingStepListClasses}>
        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <li key={step.title}>
            <ScrollReveal
              delayMs={index * LANDING_STEP_STAGGER_MS}
              className={landingStepItemClasses}
            >
              <span aria-hidden className={landingStepNumberClasses}>
                {index + 1}
              </span>
              <Heading variant="subsection" as="h3">
                {step.title}
              </Heading>
              <Text variant="muted" as="p" className="text-pretty">
                {step.description}
              </Text>
            </ScrollReveal>
          </li>
        ))}
      </ol>
    </LandingSection>
  )
}
