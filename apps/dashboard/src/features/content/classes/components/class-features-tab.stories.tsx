import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { ClassFeaturesTab } from './class-features-tab.client'

const meta = {
  title: 'Content/Classes/ClassFeaturesTab',
  component: ClassFeaturesTab,
  parameters: { layout: 'padded' },
  args: { formCtx: {} },
} satisfies Meta<typeof ClassFeaturesTab>

export default meta
type Story = StoryObj<typeof meta>

function TabStory({ features = [] as Array<Record<string, unknown>> }) {
  const form = useForm({ defaultValues: { features } })
  return (
    <FormProvider {...form}>
      <ClassFeaturesTab formCtx={{}} />
    </FormProvider>
  )
}

export const Empty: Story = {
  render: () => <TabStory />,
}

export const WithFeatures: Story = {
  render: () => (
    <TabStory
      features={[
        { level: 1, name: 'Rage', description: '<p>Bonus action fury.</p>', grants: [] },
        { level: 1, name: 'Unarmored Defense', description: '', grants: [] },
        { level: 2, name: 'Reckless Attack', description: '', grants: [] },
      ]}
    />
  ),
}
