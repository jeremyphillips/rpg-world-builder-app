import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { SpeciesHeritageTab } from './species-heritage-tab.client'

const meta = {
  title: 'Content/Species/SpeciesHeritageTab',
  component: SpeciesHeritageTab,
  parameters: { layout: 'padded' },
  args: { formCtx: {} },
} satisfies Meta<typeof SpeciesHeritageTab>

export default meta
type Story = StoryObj<typeof meta>

function TabStory({
  heritage,
  entitySource,
}: {
  heritage?: Record<string, unknown>
  entitySource?: ContentFormCtx['entitySource']
}) {
  const form = useForm({ defaultValues: { heritage } })
  return (
    <FormProvider {...form}>
      <SpeciesHeritageTab formCtx={{ entitySource }} />
    </FormProvider>
  )
}

export const Empty: Story = {
  render: () => <TabStory />,
}

export const HomebrewWithHeritage: Story = {
  render: () => (
    <TabStory
      entitySource="homebrew"
      heritage={{
        id: 'hc1',
        name: 'Draconic Ancestry',
        description: '<p>Choose your draconic heritage.</p>',
        options: [
          {
            id: 'o1',
            name: 'Breath Weapon',
            description: '<p>Exhale destructive energy.</p>',
            grants: [],
          },
          {
            id: 'o2',
            name: 'Damage Resistance',
            description: '',
            grants: [],
          },
        ],
      }}
    />
  ),
}

export const SystemSpeciesLockedHeritage: Story = {
  render: () => (
    <TabStory
      entitySource="system"
      heritage={{
        id: 'hc1',
        name: 'Draconic Ancestry',
        description: '',
        options: [
          { id: 'o1', name: 'Breath Weapon', description: '', grants: [] },
          { id: 'o2', name: 'Damage Resistance', description: '', grants: [] },
        ],
      }}
    />
  ),
}
