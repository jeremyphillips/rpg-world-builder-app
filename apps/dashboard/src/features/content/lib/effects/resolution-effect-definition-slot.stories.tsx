import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { buildSeedDamageTypeVocabulary } from '@/features/vocabulary'

import { damageDefinitionFields } from './damage-definition-fields'
import { ResolutionEffectDefinitionSlot } from './resolution-effect-definition-slot'

function DefinitionSlotStory() {
  const methods = useForm({
    defaultValues: {
      effects: [
        {
          id: 'fire',
          kind: 'damage',
          damageType: 'fire',
          roll: { dice: { count: 5, faces: 6 } },
        },
      ],
      row: { kind: 'effect-reference', effectId: 'fire', amount: 'full' },
    },
  })
  return (
    <FormProvider {...methods}>
      <ResolutionEffectDefinitionSlot
        path="row"
        libraryPath="effects"
        fields={damageDefinitionFields({
          ctx: { damageTypeVocabulary: buildSeedDamageTypeVocabulary() },
        })}
      />
    </FormProvider>
  )
}

const meta = {
  title: 'Content/Effects/ResolutionEffectDefinitionSlot',
  component: DefinitionSlotStory,
} satisfies Meta<typeof DefinitionSlotStory>

export default meta
type Story = StoryObj<typeof meta>

export const DamageDefinition: Story = {}
