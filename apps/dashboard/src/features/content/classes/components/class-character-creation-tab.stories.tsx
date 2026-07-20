import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { pickClass } from '../../lib/fixtures/pick'
import { characterCreationProficienciesToFormValues } from '../lib/character-creation/class-character-creation-proficiencies-form-values'
import { type StartingEquipmentForm } from '../lib/character-creation/class-starting-equipment-form-fields'
import { startingEquipmentToFormValues } from '../lib/character-creation/class-starting-equipment-form-values'
import { ClassCharacterCreationTab } from './class-character-creation-tab.client'

const monkStartingEquipment = startingEquipmentToFormValues(
  pickClass('monk').characterCreation!.startingEquipment!,
)
const monkProficiencies = characterCreationProficienciesToFormValues(
  pickClass('monk').characterCreation,
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
  proficiencies,
  entitySource,
}: {
  startingEquipment?: StartingEquipmentForm
  proficiencies?: ReturnType<typeof characterCreationProficienciesToFormValues>
  entitySource?: ContentFormCtx['entitySource']
}) {
  const form = useForm({
    defaultValues: {
      characterCreation: {
        ...(proficiencies ?? characterCreationProficienciesToFormValues()),
        ...(startingEquipment ? { startingEquipment } : {}),
      },
    },
  })
  return (
    <FormProvider {...form}>
      <ClassCharacterCreationTab formCtx={{ entitySource }} />
    </FormProvider>
  )
}

const rogueProficiencies = characterCreationProficienciesToFormValues(
  pickClass('rogue').characterCreation,
)

export const Empty: Story = {
  render: () => <TabStory />,
}

export const MonkStartingEquipment: Story = {
  render: () => (
    <TabStory
      entitySource="system"
      proficiencies={monkProficiencies}
      startingEquipment={monkStartingEquipment}
    />
  ),
}

export const BardStartingEquipment: Story = {
  render: () => <TabStory entitySource="system" startingEquipment={bardStartingEquipment} />,
}

export const RogueSkillChoices: Story = {
  render: () => (
    <TabStory
      entitySource="system"
      proficiencies={rogueProficiencies}
      startingEquipment={monkStartingEquipment}
    />
  ),
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
            items: [
              {
                itemKind: 'grant',
                grantTargetSource: 'equipment',
                equipmentSlug: 'dagger',
                quantity: 1,
                equipped: true,
              },
            ],
            wealth: { amount: 10, currency: 'gp' },
          },
          {
            id: 'gold',
            label: 'Starting Gold',
            items: [],
            wealth: { amount: 100, currency: 'gp' },
          },
        ],
      }}
    />
  ),
}
