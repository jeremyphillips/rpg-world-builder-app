import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { identityStepTestContext } from './identity-step.fixtures'
import { IdentityNarrativeGenerateAction } from './identity-narrative-generate-action'
import type { IdentityFormValues } from '../../../../lib/steps/identity-form-fields'

function StoryHarness() {
  const form = useForm<IdentityFormValues>({
    defaultValues: {
      name: '',
      gender: undefined,
      alignment: 'ng',
      narrative: {
        personalityTraits: [{ value: '' }],
        ideals: [{ value: '' }],
        bonds: [{ value: '' }],
        flaws: [{ value: '' }],
      },
    },
  })
  return (
    <FormProvider {...form}>
      <IdentityNarrativeGenerateAction
        context={identityStepTestContext}
        draft={createEmptyCharacterBuilderDraft()}
      />
    </FormProvider>
  )
}

const meta = {
  title: 'Character Builder/Identity Narrative Generate Action',
  component: IdentityNarrativeGenerateAction,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof IdentityNarrativeGenerateAction>

export default meta
export const Empty: StoryObj<typeof IdentityNarrativeGenerateAction> = {
  render: () => <StoryHarness />,
}
