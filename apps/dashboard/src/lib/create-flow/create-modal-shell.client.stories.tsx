import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button, DialogPanelActionRow } from '@rpg/ui'

import { CreateModalShell } from './create-modal-shell.client'

const footer = (
  <DialogPanelActionRow>
    <Button type="button" variant="outline">
      Cancel
    </Button>
    <Button type="button">Create building</Button>
  </DialogPanelActionRow>
)

const meta = {
  title: 'Create Flow/CreateModalShell',
  component: CreateModalShell,
  args: {
    open: true,
    onOpenChange: () => undefined,
    headline: 'Create building',
    description: 'Describe the building and its role in the world.',
    footer,
  },
} satisfies Meta<typeof CreateModalShell>

export default meta
type Story = StoryObj<typeof meta>

export const SinglePanel: Story = {
  args: {
    children: (
      <div>
        <p>Building details form</p>
        {Array.from({ length: 18 }, (_, index) => (
          <p key={index}>Long-form field group {index + 1}</p>
        ))}
      </div>
    ),
  },
}

export const OptionalRelationshipTabs: Story = {
  args: {
    setupSummary: {
      eyebrow: 'Setup',
      rows: [
        {
          id: 'buildingForm',
          label: 'Form',
          value: 'House',
          editTarget: { type: 'set', id: 'buildingForm' },
        },
        {
          id: 'buildingFacilityAuthoringGroup',
          label: 'Facility',
          value: 'Commercial',
          editTarget: { type: 'set', id: 'buildingFacilityAuthoringGroup' },
        },
      ],
      onRowEdit: () => undefined,
    },
    tabs: [
      {
        id: 'details',
        label: 'Details',
        content: <p>Building details form</p>,
        status: { invalid: false, dirty: true },
      },
      {
        id: 'organizations',
        label: 'Organizations',
        optional: true,
        content: <p>No organization relationships drafted.</p>,
        status: { invalid: true, issueCount: 2, dirty: true },
      },
    ],
  },
}
