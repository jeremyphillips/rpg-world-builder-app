import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { ContentFormCtx } from '../../lib/content-form-registry'
import { SpeciesHeritageOptionsEditor } from './species-heritage-options-editor.client'

const meta = {
  title: 'Content/Species/SpeciesHeritageOptionsEditor',
  component: SpeciesHeritageOptionsEditor,
  parameters: { layout: 'padded' },
  args: {
    formCtx: {},
    optionsFieldName: 'heritageChoices.0.options',
  },
} satisfies Meta<typeof SpeciesHeritageOptionsEditor>

export default meta
type Story = StoryObj<typeof meta>

function EditorStory({
  options = [] as Array<Record<string, unknown>>,
  optionsFieldName = 'heritageChoices.0.options',
  entitySource,
}: {
  options?: Array<Record<string, unknown>>
  optionsFieldName?: string
  entitySource?: ContentFormCtx['entitySource']
}) {
  const form = useForm({
    defaultValues: {
      heritageChoices: [{ name: 'Draconic Ancestry', kind: 'lineage', options }],
    },
  })
  return (
    <FormProvider {...form}>
      <SpeciesHeritageOptionsEditor
        formCtx={{ entitySource }}
        optionsFieldName={optionsFieldName}
      />
    </FormProvider>
  )
}

export const Empty: Story = {
  render: () => <EditorStory options={[]} />,
}

export const HomebrewWithOptions: Story = {
  render: () => (
    <EditorStory
      entitySource="homebrew"
      options={[
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
      ]}
    />
  ),
}

export const SystemSpeciesLockedOptions: Story = {
  render: () => (
    <EditorStory
      entitySource="system"
      options={[
        { id: 'o1', kind: 'custom', name: 'Breath Weapon', description: '', grants: [] },
        { id: 'o2', kind: 'custom', name: 'Damage Resistance', description: '', grants: [] },
      ]}
    />
  ),
}
