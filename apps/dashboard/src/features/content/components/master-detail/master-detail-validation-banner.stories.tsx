import type { Meta, StoryObj } from '@storybook/react-vite'

import { MasterDetailValidationBanner } from './master-detail-validation-banner'

const meta = {
  title: 'Content/MasterDetailValidationBanner',
  component: MasterDetailValidationBanner,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MasterDetailValidationBanner>

export default meta
type Story = StoryObj<typeof meta>

export const Hidden: Story = {
  args: { visible: false },
}

export const Visible: Story = {
  args: { visible: true },
}
