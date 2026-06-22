import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { ContentFormCtx } from '../../lib/content-form-registry'
import { SpeciesHeritageChoicesTab } from './species-heritage-choices-tab.client'

const meta = {
  title: 'Content/Species/SpeciesHeritageChoicesTab',
  component: SpeciesHeritageChoicesTab,
  parameters: { layout: 'padded' },
  args: { formCtx: {} },
} satisfies Meta<typeof SpeciesHeritageChoicesTab>

export default meta
type Story = StoryObj<typeof meta>

function TabStory({
  heritageChoices = [] as Array<Record<string, unknown>>,
  entitySource,
}: {
  heritageChoices?: Array<Record<string, unknown>>
  entitySource?: ContentFormCtx['entitySource']
}) {
  const form = useForm({ defaultValues: { heritageChoices } })
  return (
    <FormProvider {...form}>
      <SpeciesHeritageChoicesTab formCtx={{ entitySource }} />
    </FormProvider>
  )
}

export const Empty: Story = {
  render: () => <TabStory />,
}

export const HomebrewWithChoices: Story = {
  render: () => (
    <TabStory
      entitySource="homebrew"
      heritageChoices={[
        {
          id: 'hc1',
          name: 'Draconic Ancestry',
          kind: 'lineage',
          description: '<p>Choose your draconic heritage.</p>',
          options: [
            {
              id: 'o1',
              kind: 'custom',
              name: 'Breath Weapon',
              description: '<p>Exhale destructive energy.</p>',
              grants: [],
            },
            {
              id: 'o2',
              kind: 'custom',
              name: 'Damage Resistance',
              description: '',
              grants: [],
            },
          ],
        },
        {
          id: 'hc2',
          name: 'Elven Lineage',
          kind: 'ancestry',
          description: '',
          options: [{ id: 'o3', kind: 'custom', name: 'Darkvision', description: '', grants: [] }],
        },
      ]}
    />
  ),
}

export const SystemSpeciesLockedChoices: Story = {
  render: () => (
    <TabStory
      entitySource="system"
      heritageChoices={[
        {
          id: 'hc1',
          name: 'Draconic Ancestry',
          kind: 'lineage',
          description: '',
          options: [
            { id: 'o1', kind: 'custom', name: 'Breath Weapon', description: '', grants: [] },
            { id: 'o2', kind: 'custom', name: 'Damage Resistance', description: '', grants: [] },
          ],
        },
        {
          id: 'hc2',
          name: 'Giant Ancestry',
          kind: 'ancestry',
          description: '',
          options: [{ id: 'o3', kind: 'custom', name: 'Large Form', description: '', grants: [] }],
        },
      ]}
    />
  ),
}
