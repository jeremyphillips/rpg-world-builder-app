import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { ClassFeaturesTab } from './class-features-tab.client'

const meta = {
  title: 'Content/Classes/ClassFeaturesTab',
  component: ClassFeaturesTab,
  parameters: { layout: 'padded' },
  args: { formCtx: {} },
} satisfies Meta<typeof ClassFeaturesTab>

export default meta
type Story = StoryObj<typeof meta>

function TabStory({
  features = [] as Array<Record<string, unknown>>,
  entitySource,
}: {
  features?: Array<Record<string, unknown>>
  entitySource?: ContentFormCtx['entitySource']
}) {
  const form = useForm({ defaultValues: { features } })
  return (
    <FormProvider {...form}>
      <ClassFeaturesTab formCtx={{ entitySource }} />
    </FormProvider>
  )
}

export const Empty: Story = {
  render: () => <TabStory />,
}

export const HomebrewWithFeatures: Story = {
  render: () => (
    <TabStory
      entitySource="homebrew"
      features={[
        { id: 'f1', level: 1, name: 'Rage', description: '<p>Bonus action fury.</p>', grants: [] },
        { id: 'f2', level: 1, name: 'Unarmored Defense', description: '', grants: [] },
        { id: 'f3', level: 2, name: 'Reckless Attack', description: '', grants: [] },
      ]}
    />
  ),
}

export const SystemClassLockedFeatures: Story = {
  render: () => (
    <TabStory
      entitySource="system"
      features={[
        { id: 'f1', level: 1, name: 'Rage', description: '', grants: [] },
        { id: 'f2', level: 1, name: 'Unarmored Defense', description: '', grants: [] },
      ]}
    />
  ),
}
