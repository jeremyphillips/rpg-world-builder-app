import type { Meta, StoryObj } from '@storybook/react-vite'

import { Sheet } from './sheet.client'
import { SheetMediaScroll } from './sheet-media-scroll.client'
import { Text } from './text'

const meta = {
  title: 'Overlays/SheetMediaScroll',
  component: SheetMediaScroll,
  args: {
    media: null,
    header: null,
    children: null,
  },
} satisfies Meta<typeof SheetMediaScroll>

export default meta
type Story = StoryObj<typeof meta>

export const StickyHeaderWithHeroMedia: Story = {
  render: () => (
    <Sheet.Root defaultOpen>
      <Sheet.Content hasMedia className="max-h-[32rem] w-[min(100vw-2rem,28rem)]">
        <SheetMediaScroll
          media={
            <div className="aspect-[4/3] w-full bg-muted">
              <img
                alt=""
                className="size-full object-cover"
                src="https://picsum.photos/seed/sheet-media-scroll/960/720"
              />
            </div>
          }
          header={
            <Sheet.Header
              headline="Fighter"
              description="A martial archetype focused on weapons and armor."
            />
          }
        >
          <div className="space-y-4 p-4">
            <Text variant="muted">
              Scroll the sheet body to see the identity header stick below the hero media.
            </Text>
            {Array.from({ length: 8 }, (_, index) => (
              <Text key={index}>Detail paragraph {index + 1}</Text>
            ))}
          </div>
        </SheetMediaScroll>
      </Sheet.Content>
    </Sheet.Root>
  ),
}
