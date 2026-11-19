import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { MonsterFormValues } from '../../../lib/monster-form-values'
import { monsterFormTestValues } from '../../../lib/monster-form-test-values'
import { MonsterTrueFormDesignation } from './true-form-designation'

function StoryHost() {
  const form = useForm<MonsterFormValues>({
    defaultValues: monsterFormTestValues({
      name: 'Werebear',
      forms: {
        profileFormId: 'profile',
        trueForm: { kind: 'defined', formId: 'humanoid' },
        definedForms: [
          { id: 'humanoid', name: 'Humanoid' },
          { id: 'bear', name: 'Bear', overrides: { sizes: ['large'] } },
        ],
      },
    }),
  })
  return (
    <FormProvider {...form}>
      <MonsterTrueFormDesignation />
    </FormProvider>
  )
}

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterTrueFormDesignation',
  component: StoryHost,
} satisfies Meta<typeof StoryHost>

export default meta
type Story = StoryObj<typeof meta>

export const DefinedForm: Story = {}
