import type { Meta, StoryObj } from '@storybook/react-vite'

import { FieldGroupSummaryTrigger } from './field-group-summary-trigger.client'

const meta = {
  title: 'Forms/Layout/FieldGroupSummaryTrigger',
  component: FieldGroupSummaryTrigger,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FieldGroupSummaryTrigger>

export default meta
type Story = StoryObj<typeof meta>

export const Available: Story = {
  args: {
    size: 'md',
    openLabel: 'Change',
    unsavedSuffix: ' · Unsaved',
    showDirtySuffix: false,
    disabled: false,
    onOpen: () => undefined,
    summary: {
      status: { label: 'Available', tone: 'success', indicator: 'dot' },
      detail: 'All players',
    },
  },
}

export const Unavailable: Story = {
  args: {
    size: 'md',
    openLabel: 'Change',
    unsavedSuffix: ' · Unsaved',
    showDirtySuffix: false,
    disabled: false,
    onOpen: () => undefined,
    summary: {
      status: { label: 'Unavailable', tone: 'warning', indicator: 'inactive' },
      detail: 'DM only',
      chrome: { variant: 'accent', tone: 'warning', emphasis: 'faint' },
    },
  },
}

export const Dirty: Story = {
  args: {
    ...Available.args,
    showDirtySuffix: true,
  },
}

export const WithSecondaryLine: Story = {
  args: {
    ...Available.args,
    summary: {
      status: { label: 'Unavailable', tone: 'warning', indicator: 'inactive' },
      detail: 'DM only',
      secondary: 'Hidden from discovery and selection in this campaign.',
      chrome: { variant: 'accent', tone: 'warning', emphasis: 'faint' },
    },
  },
}
