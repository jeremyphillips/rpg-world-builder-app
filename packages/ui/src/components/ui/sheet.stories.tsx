import type { Meta, StoryObj } from '@storybook/react-vite'

import { Sheet } from './sheet.client'
import { Button } from './button.client'
import { Input } from './input.client'
import { dialogPanelActionRowClasses } from './dialog-panel.variants'

const meta = {
  title: 'Primitives/Sheet',
  component: Sheet.Content,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Sheet.Content>

export default meta
type Story = StoryObj<typeof meta>

export const BottomSide: Story = {
  render: () => (
    <Sheet.Root>
      <Sheet.Trigger asChild>
        <Button className="m-8">Open bottom sheet</Button>
      </Sheet.Trigger>
      <Sheet.Content side="bottom" size="lg" surface="field-container">
        <Sheet.Header headline="Class Preview" />
        <Sheet.Body>Preview rail content</Sheet.Body>
      </Sheet.Content>
    </Sheet.Root>
  ),
}

export const RightSide: Story = {
  render: () => (
    <Sheet.Root>
      <Sheet.Trigger asChild>
        <Button className="m-8">Open sheet</Button>
      </Sheet.Trigger>
      <Sheet.Content>
        <Sheet.Header
          headline="Add creature type"
          description="Custom types appear as Custom in this campaign."
        />
        <Sheet.Body className="space-y-4">
          <Input aria-label="Name" placeholder="Name" />
          <Input aria-label="Id" placeholder="slug-id" />
        </Sheet.Body>
        <Sheet.Footer>
          <div className={dialogPanelActionRowClasses}>
            <Sheet.Close asChild>
              <Button variant="outline">Cancel</Button>
            </Sheet.Close>
            <Button>Save</Button>
          </div>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet.Root>
  ),
}
