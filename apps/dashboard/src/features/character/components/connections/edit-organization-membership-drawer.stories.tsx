import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { lanternGuild } from './picker/organization-picker-drawer.fixtures'
import { EditOrganizationMembershipDrawer } from './edit-organization-membership-drawer'

const meta = {
  title: 'Character/EditOrganizationMembershipDrawer',
  component: EditOrganizationMembershipDrawer,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EditOrganizationMembershipDrawer>

export default meta
type Story = StoryObj<typeof EditOrganizationMembershipDrawer>

function OpenEditDrawer(
  props: Omit<
    React.ComponentProps<typeof EditOrganizationMembershipDrawer>,
    'open' | 'onOpenChange' | 'onSave' | 'onRemove'
  >,
) {
  const [open, setOpen] = React.useState(true)
  return (
    <EditOrganizationMembershipDrawer
      {...props}
      open={open}
      onOpenChange={setOpen}
      onSave={async () => undefined}
      onRemove={async () => undefined}
    />
  )
}

export const Default: Story = {
  render: () => (
    <OpenEditDrawer
      organization={lanternGuild}
      characterName="Frug Daergel"
      currentTitle="Guildmaster"
    />
  ),
}

export const HistoricalTitle: Story = {
  render: () => (
    <OpenEditDrawer
      organization={lanternGuild}
      characterName="Frug Daergel"
      currentTitle="Custom Chronicler"
    />
  ),
}
