import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN } from '../../../classes/lib/class-feature-form-labels'
import { FormEmbeddedMasterDetailEditor } from '../form-embedded-master-detail-editor'

const itemFields = [{ type: 'text' as const, name: 'name', label: 'Name', required: true }]

type FeatureRow = { id?: string; name?: string; level?: number }

function EditorStory({
  features = [] as FeatureRow[],
  entitySource,
}: {
  features?: FeatureRow[]
  entitySource?: 'system' | 'homebrew'
}) {
  const form = useForm({ defaultValues: { features } })
  return (
    <FormProvider {...form}>
      <FormEmbeddedMasterDetailEditor
        formCtx={{ entitySource }}
        fieldName="features"
        itemFields={itemFields}
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
