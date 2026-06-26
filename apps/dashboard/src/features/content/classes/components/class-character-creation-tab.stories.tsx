import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { ContentFormCtx } from '../../lib/content-form-registry'
import { pickClass } from '../../lib/fixtures/pick'
import {
  startingEquipmentToFormValues,
  type StartingEquipmentForm,
} from '../lib/class-starting-equipment-form-def'
import { ClassCharacterCreationTab } from './class-character-creation-tab.client'

const monkStartingEquipment = startingEquipmentToFormValues(
  pickClass('monk').characterCreation!.startingEquipment!,
)
const bardStartingEquipment = startingEquipmentToFormValues(
  pickClass('bard').characterCreation!.startingEquipment!,
)

const meta = {
  title: 'Content/Classes/ClassCharacterCreationTab',
  component: ClassCharacterCreationTab,
  parameters: { layout: 'padded' },
  args: { formCtx: {} },
} satisfies Meta<typeof ClassCharacterCreationTab>

export default meta
type Story = StoryObj<typeof meta>

function TabStory({
  startingEquipment,
  entitySource,
}: {
  startingEquipment?: StartingEquipmentForm
  entitySource?: ContentFormCtx['entitySource']
}) {
  const form = useForm({
    defaultValues: {
      characterCreation: startingEquipment ? { startingEquipment } : undefined,
    },
  })
  return (
    <FormProvider {...form}>
      <ClassCharacterCreationTab formCtx={{ entitySource }} />
    </FormProvider>
  )
}

export const Empty: Story = {
  render: () => <TabStory />,
}

export const MonkStartingEquipment: Story = {
  render: () => <TabStory entitySource="system" startingEquipment={monkStartingEquipment} />,
}

export const BardStartingEquipment: Story = {
  render: () => <TabStory entitySource="system" startingEquipment={bardStartingEquipment} />,
}

export const HomebrewWithStartingEquipment: Story = {
  render: () => (
    <TabStory
      entitySource="homebrew"
      startingEquipment={{
        choose: 1,
        options: [
          {
            id: 'standard',
            label: 'Standard Equipment',
            description: '<p>Leather armor and a dagger.</p>',
            items: [
              {
                itemKind: 'fixed',
                equipmentSlug: 'dagger',
                quantity: 1,
                equipped: true,
              },
            ],
            wealth: { gp: 10 },
          },
          {
            id: 'gold',
            label: 'Starting Gold',
            description: '',
            items: [],
            wealth: { gp: 100 },
          },
        ],
      }}
    />
  ),
}
