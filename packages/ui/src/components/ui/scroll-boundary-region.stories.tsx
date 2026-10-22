import type { Meta, StoryObj } from '@storybook/react-vite'

import { Heading } from './heading'
import { Text } from './text'

import { ScrollBoundaryRegion } from './scroll-boundary-region.client'

const meta = {
  title: 'Primitives/ScrollBoundaryRegion',
  component: ScrollBoundaryRegion,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ScrollBoundaryRegion>

export default meta
type Story = StoryObj<typeof meta>

const scrollItems = Array.from({ length: 12 }, (_, index) => `Scroll item ${index + 1}`)

function ScrollBoundaryRegionDemo() {
  return (
    <div className="flex w-[21rem] flex-col rounded-lg border border-border-subtle bg-field-container [--surface-current:var(--field-container)]">
      <div className="border-b border-border-subtle px-4 py-4">
        <Heading variant="card" as="p">
          Header
        </Heading>
        <Text variant="supporting">Fixed section above the scroll boundary.</Text>
      </div>
      <ScrollBoundaryRegion className="max-h-48">
        <div className="space-y-3 px-4 py-4">
          {scrollItems.map((item) => (
            <p key={item} className="text-sm text-foreground">
              {item}
            </p>
          ))}
        </div>
      </ScrollBoundaryRegion>
      <div className="border-t border-border-subtle px-4 py-4">
        <Text variant="emphasis" className="text-foreground">
          Footer
        </Text>
      </div>
    </div>
  )
}

export const Default: Story = {
  render: () => <ScrollBoundaryRegionDemo />,
}
