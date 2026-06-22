import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { SUBCLASSES_FOR_FIGHTER } from '../fixtures'
import { ClassSubclassesTab } from './class-subclasses-tab.client'

const meta = {
  title: 'Content/Classes/ClassSubclassesTab',
  component: ClassSubclassesTab,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ClassSubclassesTab>

export default meta
type Story = StoryObj<typeof meta>

function TabStory({
  subclassChoiceLevel = '3',
  mode = 'edit' as const,
}: {
  subclassChoiceLevel?: string
  mode?: 'create' | 'edit'
}) {
  const form = useForm({ defaultValues: { subclassChoiceLevel } })
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

export const GatedNoChoiceLevel: Story = {
  render: () => <TabStory subclassChoiceLevel="none" />,
}

export const CreateMode: Story = {
  render: () => <TabStory mode="create" />,
}
