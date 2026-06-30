import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { SpeciesTraitsTab } from './species-traits-tab.client'

const meta = {
  title: 'Content/Species/SpeciesTraitsTab',
  component: SpeciesTraitsTab,
  parameters: { layout: 'padded' },
  args: { formCtx: {} },
} satisfies Meta<typeof SpeciesTraitsTab>

export default meta
type Story = StoryObj<typeof meta>

function TabStory({
  traits = [] as Array<Record<string, unknown>>,
  entitySource,
}: {
  traits?: Array<Record<string, unknown>>
  entitySource?: ContentFormCtx['entitySource']
}) {
  const form = useForm({ defaultValues: { traits } })
  return (
    <FormProvider {...form}>
      <SpeciesTraitsTab formCtx={{ entitySource }} />
    </FormProvider>
  )
}

export const Empty: Story = {
  render: () => <TabStory />,
}

export const HomebrewWithTraits: Story = {
  render: () => (
    <TabStory
      entitySource="homebrew"
      traits={[
        {
          id: 't1',
          kind: 'custom',
          name: 'Darkvision',
          description: '<p>You see in dim light.</p>',
          grants: [],
        },
        {
          id: 't2',
          kind: 'custom',
          name: 'Fey Ancestry',
          description: '',
          grants: [],
        },
        {
          id: 't3',
          kind: 'grant',
          overrideDisplay: false,
          grants: [],
        },
      ]}
    />
  ),
}

export const SystemSpeciesLockedTraits: Story = {
  render: () => (
    <TabStory
      entitySource="system"
      traits={[
        { id: 't1', kind: 'custom', name: 'Darkvision', description: '', grants: [] },
        { id: 't2', kind: 'custom', name: 'Keen Senses', description: '', grants: [] },
      ]}
    />
  ),
}
