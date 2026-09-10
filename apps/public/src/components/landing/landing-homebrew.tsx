import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Text } from '@rpg/ui'

import { HOMEBREW_SHOWCASE_ITEMS } from './landing-content'
import { LandingSection } from './landing-section'
import { ScrollReveal } from './scroll-reveal.client'

const homebrewAccordionClasses = 'mx-auto w-full max-w-2xl'

export function LandingHomebrew() {
  return (
    <LandingSection
      id="homebrew"
      eyebrow="Homebrew, structured"
      heading="Author every piece of your world"
      description="Purpose-built editors for each content type — so your homebrew is as dependable at the table as anything in a published book."
    >
      <ScrollReveal className={homebrewAccordionClasses}>
        <Accordion type="single" collapsible defaultValue={HOMEBREW_SHOWCASE_ITEMS[0]?.value}>
          {HOMEBREW_SHOWCASE_ITEMS.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.title}</AccordionTrigger>
              <AccordionContent>
                <Text variant="muted" as="p" className="text-pretty">
                  {item.description}
                </Text>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollReveal>
    </LandingSection>
  )
}
