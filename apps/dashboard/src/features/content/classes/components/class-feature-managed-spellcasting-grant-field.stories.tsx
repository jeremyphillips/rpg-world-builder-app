import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassFeatureManagedSpellcastingGrantField } from './class-feature-managed-spellcasting-grant-field'

const meta = {
  title: 'Content/Classes/ClassFeatureManagedSpellcastingGrantField',
  component: ClassFeatureManagedSpellcastingGrantField,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ClassFeatureManagedSpellcastingGrantField>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => <ClassFeatureManagedSpellcastingGrantField />,
}
