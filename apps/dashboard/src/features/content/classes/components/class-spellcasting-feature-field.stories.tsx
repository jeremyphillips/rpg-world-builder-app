import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { featureToFormRow } from '../lib/class-feature-form-fields'
import { createSpellcastingFeature } from '../lib/class-spellcasting-features'
import { ClassSpellcastingFeatureField } from './class-spellcasting-feature-field'

const meta = {
  title: 'Content/Classes/ClassSpellcastingFeatureField',
  component: ClassSpellcastingFeatureField,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ClassSpellcastingFeatureField>

export default meta
type Story = StoryObj

function FeatureSummaryHarness({ withGrantingFeature }: { withGrantingFeature: boolean }) {
  const form = useForm({
    defaultValues: {
      features: withGrantingFeature
        ? [featureToFormRow(createSpellcastingFeature({ level: 2, usesPactMagic: false }))]
        : [],
    },
  })

  return (
    <FormProvider {...form}>
      <ClassSpellcastingFeatureField />
    </FormProvider>
  )
}

export const MissingGrantingFeature: Story = {
  name: 'No spellcasting feature',
  render: () => <FeatureSummaryHarness withGrantingFeature={false} />,
}

export const WithGrantingFeature: Story = {
  name: 'Managed spellcasting feature',
  render: () => <FeatureSummaryHarness withGrantingFeature />,
}
