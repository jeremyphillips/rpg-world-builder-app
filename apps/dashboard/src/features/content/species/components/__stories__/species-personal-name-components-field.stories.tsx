import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { SpeciesPersonalNameComponentsField } from '../species-personal-name-components-field'

function StoryWrapper({
  defaultValues = { culture: { naming: { supported: true, personalNameComponents: [] } } },
}: {
  defaultValues?: {
    culture: { naming: { supported: true; personalNameComponents: string[] } }
  }
}) {
  const form = useForm({ defaultValues })

  return (
    <FormProvider {...form}>
      <SpeciesPersonalNameComponentsField />
    </FormProvider>
  )
}

const meta = {
  title: 'Dashboard/Species/SpeciesPersonalNameComponentsField',
  component: StoryWrapper,
} satisfies Meta<typeof StoryWrapper>

export default meta

type Story = StoryObj<typeof meta>

export const Collapsed: Story = {}

export const Expanded: Story = {
  args: {
    defaultValues: {
      culture: { naming: { supported: true, personalNameComponents: ['family'] } },
    },
  },
}
