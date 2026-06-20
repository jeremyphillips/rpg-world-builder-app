import type { Meta, StoryObj } from '@storybook/react-vite'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion.client'
import { Text } from './text'

const meta = {
  title: 'Components/Accordion',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible defaultValue="item-1" className="max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is a species?</AccordionTrigger>
        <AccordionContent>
          <Text variant="muted">A playable ancestry or people in your campaign ruleset.</Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>What is heritage?</AccordionTrigger>
        <AccordionContent>
          <Text variant="muted">
            A character-creation choice such as elven lineage or draconic ancestry.
          </Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const SectionVariantMultipleOpen: Story = {
  render: () => (
    <Accordion
      type="multiple"
      defaultValue={['identity', 'traits']}
      variant="section"
      className="flex max-w-lg flex-col gap-6"
    >
      <AccordionItem value="identity" variant="section">
        <AccordionTrigger variant="section">Identity</AccordionTrigger>
        <AccordionContent>
          <Text variant="small">Name, slug, and description fields would live here.</Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="traits" variant="section">
        <AccordionTrigger variant="section">Traits</AccordionTrigger>
        <AccordionContent>
          <Text variant="small">Repeatable trait rows would live here.</Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
