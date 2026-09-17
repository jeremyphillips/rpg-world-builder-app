import type { Meta, StoryObj } from '@storybook/react-vite'

import { DialogPanelScrollRegion } from './dialog-panel-scroll-region.client'
import { dialogPanelHeaderClasses } from './dialog-panel.variants'

const meta = {
  title: 'Primitives/DialogPanelScrollRegion',
  component: DialogPanelScrollRegion,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DialogPanelScrollRegion>

export default meta
type Story = StoryObj<typeof meta>

function OverlayScrollDemo() {
  return (
    <div className="flex h-64 w-full max-w-md flex-col overflow-hidden rounded-lg border bg-background">
      <div className={dialogPanelHeaderClasses}>
        <h2 className="text-lg font-semibold">Overlay header</h2>
        <p className="text-sm text-muted-foreground">Pinned above the scrollport.</p>
      </div>
      <DialogPanelScrollRegion>
        {Array.from({ length: 16 }, (_, index) => (
          <p key={index} className="mb-3 text-sm">
            Row {index + 1}: scroll to reveal boundary shadows below the header border.
          </p>
        ))}
      </DialogPanelScrollRegion>
    </div>
  )
}

export const Default: Story = {
  render: () => <OverlayScrollDemo />,
}
