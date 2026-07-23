import type { Meta, StoryObj } from '@storybook/react-vite'

import { InsetPanel } from './inset-panel.client'

const meta = {
  title: 'Primitives/InsetPanel',
  component: InsetPanel,
  parameters: { layout: 'padded' },
  args: {
    children: (
      <InsetPanel.Text>
        Placeholder copy scales with the panel size via <code>InsetPanel.Text</code>.
      </InsetPanel.Text>
    ),
  },
} satisfies Meta<typeof InsetPanel>

export default meta
type Story = StoryObj<typeof meta>

export const SolidMuted: Story = {
  args: {
    surface: { emphasis: 'default' },
    borderStyle: 'solid',
    size: 'sm',
  },
}

export const SolidSunkenDefault: Story = {
  args: {
    borderStyle: 'solid',
    size: 'sm',
  },
}

export const DashedGate: Story = {
  args: {
    ...insetPanelGateStoryProps(),
    children: (
      <InsetPanel.Text>
        Add a subclass choice feature on the <strong>Features</strong> tab before authoring
        subclasses.
      </InsetPanel.Text>
    ),
  },
}

export const DashedEmpty: Story = {
  args: {
    ...insetPanelEmptyStoryProps(),
    children: <InsetPanel.Text>No items are available.</InsetPanel.Text>,
  },
}

export const ScorePool: Story = {
  args: {
    borderStyle: 'dashed',
    surface: { emphasis: 'subtle' },
    size: 'md',
    children: (
      <>
        <div className="flex min-h-16 flex-wrap items-center gap-3" />
        <InsetPanel.Text as="p" variant="small" aria-live="polite">
          3 scores remaining
        </InsetPanel.Text>
      </>
    ),
  },
}

function insetPanelGateStoryProps() {
  return {
    borderStyle: 'dashed' as const,
    surface: { elevation: 'sunken' } as const,
    size: 'lg' as const,
    align: 'center' as const,
  }
}

function insetPanelEmptyStoryProps() {
  return {
    borderStyle: 'dashed' as const,
    surface: {} as const,
    size: 'md' as const,
    align: 'center' as const,
  }
}
