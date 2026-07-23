import type { Meta, StoryObj } from '@storybook/react-vite'

import { CampaignAccessDisclosure } from './campaign-access-disclosure.client'

const meta = {
  title: 'Content/Campaign Access/Disclosure',
  component: CampaignAccessDisclosure,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CampaignAccessDisclosure>

export default meta

type Story = StoryObj<typeof meta>

export const CollapsedAvailable: Story = {
  args: {
    summary: { primary: 'Available · All players' },
    isDirty: false,
    open: false,
    onOpenChange: () => undefined,
    idPrefix: 'story',
    children: <p className="text-sm">Expanded campaign access fields render here.</p>,
  },
}

export const CollapsedUnavailable: Story = {
  args: {
    summary: {
      primary: 'Unavailable',
      secondary: 'This content cannot be discovered or selected in this campaign.',
    },
    isDirty: false,
    open: false,
    onOpenChange: () => undefined,
    idPrefix: 'story',
    children: <p className="text-sm">Expanded campaign access fields render here.</p>,
  },
}

export const CollapsedDirty: Story = {
  args: {
    summary: { primary: 'Available · DM only' },
    isDirty: true,
    open: false,
    onOpenChange: () => undefined,
    idPrefix: 'story',
    children: <p className="text-sm">Expanded campaign access fields render here.</p>,
  },
}

export const Expanded: Story = {
  args: {
    summary: { primary: 'Available · 3 specific players' },
    isDirty: false,
    open: true,
    onOpenChange: () => undefined,
    idPrefix: 'story',
    children: <p className="text-sm">Expanded campaign access fields render here.</p>,
  },
}
