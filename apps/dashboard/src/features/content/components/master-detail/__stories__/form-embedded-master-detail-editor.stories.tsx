import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { FormItem } from '@rpg/ui/form'

import { CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN } from '../../../classes/lib/class-feature-form-labels'
import { FormEmbeddedMasterDetailEditor } from '../form-embedded-master-detail-editor'

const itemFields: FormItem[] = [{ type: 'text', name: 'name', label: 'Name', required: true }]

const tallItemFields = Array.from({ length: 12 }, (_, index) => ({
  type: 'text' as const,
  name: `field${index}`,
  label: `Detail field ${index + 1}`,
  required: true,
}))

type FeatureRow = { id?: string; name?: string; level?: number }

function EditorStory({
  features = [] as FeatureRow[],
  entitySource,
  fields = itemFields,
}: {
  features?: FeatureRow[]
  entitySource?: 'system' | 'homebrew'
  fields?: FormItem[]
}) {
  const form = useForm({ defaultValues: { features } })
  return (
    <FormProvider {...form}>
      <FormEmbeddedMasterDetailEditor
        formCtx={{ entitySource }}
        fieldName="features"
        itemFields={fields}
        itemNoun={CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN}
        listTitle="Features"
        ariaLabel="Features"
        addLabel="Add feature"
        idPrefix="class-feature"
        mapListItem={({ row }) => {
          const feature = row as FeatureRow | undefined
          const name = typeof feature?.name === 'string' ? feature.name.trim() : ''
          return {
            title: name,
            eyebrow: feature?.level !== undefined ? `Level ${feature.level}` : undefined,
          }
        }}
      />
    </FormProvider>
  )
}

const longFeatures = Array.from({ length: 20 }, (_, index) => ({
  id: `f${index}`,
  name: `Feature ${index + 1}`,
  level: index + 1,
}))

const meta = {
  title: 'Content/FormEmbeddedMasterDetailEditor',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj

export const Empty: Story = {
  render: () => <EditorStory />,
}

export const WithRows: Story = {
  render: () => (
    <EditorStory
      features={[
        { id: 'f1', name: 'Rage', level: 1 },
        { id: 'f2', name: 'Reckless Attack', level: 2 },
      ]}
    />
  ),
}

export const LongCollection: Story = {
  render: () => <EditorStory features={longFeatures} />,
}

export const ConstrainedViewport: Story = {
  render: () => (
    <div className="h-64 [--master-detail-list-max-block-size:12rem]">
      <EditorStory features={longFeatures} />
    </div>
  ),
}

export const TallerDetailThanRail: Story = {
  render: () => (
    <EditorStory
      fields={tallItemFields}
      features={[
        { id: 'f1', name: 'Rage', level: 1 },
        { id: 'f2', name: 'Reckless Attack', level: 2 },
      ]}
    />
  ),
}

export const SystemLocked: Story = {
  render: () => (
    <EditorStory
      entitySource="system"
      features={[
        { id: 'f1', name: 'Rage', level: 1 },
        { id: 'f2', name: 'Reckless Attack', level: 2 },
      ]}
    />
  ),
}
