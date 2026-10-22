import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from './button.client'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { DividedStack } from './divided-stack'
import { Panel } from './panel'
import { PANEL_DENSITIES, PANEL_TONES } from './panel.variants'

const meta = {
  title: 'Primitives/Panel',
  component: Panel,
  parameters: { layout: 'padded' },
  args: {
    children: 'Related notes and controls stay in this group.',
  },
} satisfies Meta<typeof Panel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {PANEL_TONES.map((tone) => (
        <Panel key={tone} tone={tone}>
          {tone}
        </Panel>
      ))}
    </div>
  ),
}

export const Densities: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {PANEL_DENSITIES.map((density) => (
        <Panel key={density} tone="subtle" density={density}>
          {density}
        </Panel>
      ))}
    </div>
  ),
}

export const Bleed: Story = {
  args: {
    tone: 'subtle',
    bleed: true,
    children: 'Flush to the frame. Children own their inset.',
  },
}

export const DirectChildren: Story = {
  render: () => (
    <Panel tone="transparent" className="flex flex-col gap-2">
      <span>First</span>
      <span>Second</span>
    </Panel>
  ),
}

export const Nested: Story = {
  render: () => (
    <Panel tone="quiet">
      <Panel tone="faint">Faint group inside a quiet panel.</Panel>
    </Panel>
  ),
}

export const InsideCard: Story = {
  render: () => (
    <Card tone="quiet" density="comfortable">
      <CardHeader>
        <CardTitle>Quiet card</CardTitle>
      </CardHeader>
      <CardContent>
        <Panel tone="faint">Faint panel inside the card.</Panel>
      </CardContent>
    </Card>
  ),
}

export const CardInsidePanel: Story = {
  render: () => (
    <Panel tone="transparent" className="flex flex-col gap-3">
      <Card tone="quiet">
        <CardHeader>
          <CardTitle>Quiet card</CardTitle>
        </CardHeader>
        <CardContent>The frame stays transparent.</CardContent>
      </Card>
    </Panel>
  ),
}

export const FocusAtEdge: Story = {
  render: () => (
    <Panel tone="subtle" density="compact">
      <Button type="button">Focus me</Button>
    </Panel>
  ),
}

export const CompactLedger: Story = {
  render: () => (
    <Panel tone="subtle" density="compact" className="flex flex-col gap-2">
      <div className="rounded-md bg-surface-strong px-3 py-2">Chip keeps its own padding</div>
    </Panel>
  ),
}

export const CompactResourceSummary: Story = {
  render: () => (
    <Panel tone="transparent" density="compact">
      <DividedStack density="compact">
        <div>Currency</div>
        <div>Magic items</div>
      </DividedStack>
    </Panel>
  ),
}
