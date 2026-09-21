import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { ClassSpellcastingFeatureAvailabilityField } from './class-spellcasting-feature-availability-field'

const meta = {
  title: 'Content/Classes/ClassSpellcastingFeatureAvailabilityField',
  component: ClassSpellcastingFeatureAvailabilityField,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ClassSpellcastingFeatureAvailabilityField>

export default meta
type Story = StoryObj

function AvailabilityHarness({ available = true }: { available?: boolean }) {
  const form = useForm({
    defaultValues: {
      features: [{ available }],
    },
  })

  return (
    <FormProvider {...form}>
      <ClassSpellcastingFeatureAvailabilityField namePrefix="features.0" />
    </FormProvider>
  )
}

export const Available: Story = {
  render: () => <AvailabilityHarness available />,
}

export const Unavailable: Story = {
  render: () => <AvailabilityHarness available={false} />,
}
