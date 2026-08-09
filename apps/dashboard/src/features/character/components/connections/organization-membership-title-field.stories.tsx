import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { OrganizationMembershipTitleField } from './organization-membership-title-field.client'
import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from './organization-membership-title-field.types'

const meta = {
  title: 'Character/OrganizationMembershipTitleField',
  component: OrganizationMembershipTitleField,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof OrganizationMembershipTitleField>

export default meta
type Story = StoryObj<typeof OrganizationMembershipTitleField>

function ControlledTitleField(
  props: Omit<React.ComponentProps<typeof OrganizationMembershipTitleField>, 'onValueChange'>,
) {
  const [value, setValue] = React.useState(props.value)
  return <OrganizationMembershipTitleField {...props} value={value} onValueChange={setValue} />
}

export const Default: Story = {
  render: () => (
    <ControlledTitleField
      kind="professional"
      value={ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE}
      idPrefix="story-membership"
    />
  ),
}

export const HistoricalTitle: Story = {
  render: () => (
    <ControlledTitleField
      kind="professional"
      value="Custom Chronicler"
      idPrefix="story-membership-historical"
    />
  ),
}
