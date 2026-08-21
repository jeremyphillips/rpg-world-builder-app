import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { withDashboardProviders } from '../../../../../.storybook/decorators'
import { SUBCLASSES_FOR_FIGHTER } from '../fixtures'
import { ClassSubclassesTab } from './class-subclasses-tab'

const meta = {
  title: 'Content/Classes/ClassSubclassesTab',
  component: ClassSubclassesTab,
  parameters: { layout: 'padded' },
  decorators: [withDashboardProviders],
} satisfies Meta<typeof ClassSubclassesTab>

export default meta
type Story = StoryObj<typeof meta>

function TabStory({
  features = [
    {
      kind: 'subclass-choice',
      id: 'fighter-subclass',
      name: 'Fighter Subclass',
      level: 3,
      grants: [],
    },
  ],
  mode = 'edit' as const,
}: {
  features?: Array<Record<string, unknown>>
  mode?: 'create' | 'edit'
}) {
  const form = useForm({ defaultValues: { features } })
  return (
    <FormProvider {...form}>
      <ClassSubclassesTab
        campaignId="camp_1"
        classId="srd-cc-5.2.1:fighter"
        mode={mode}
        formCtx={{}}
        subclassesOverride={mode === 'edit' ? SUBCLASSES_FOR_FIGHTER : undefined}
      />
    </FormProvider>
  )
}

export const EditMode: Story = {
  render: () => <TabStory />,
}

export const GatedNoChoiceFeature: Story = {
  render: () => <TabStory features={[]} />,
}

export const CreateMode: Story = {
  render: () => <TabStory mode="create" />,
}
