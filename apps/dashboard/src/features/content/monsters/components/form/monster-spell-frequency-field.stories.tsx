import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { MonsterSpellFrequencyField } from './monster-spell-frequency-field'

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterSpellFrequencyField',
  component: MonsterSpellFrequencyField,
  args: {
    spellLimitName: 'spell.limitedUse',
    actionLimitName: 'limitedUse',
  },
} satisfies Meta<typeof MonsterSpellFrequencyField>

export default meta

type Story = StoryObj<typeof meta>

function Host({
  spellLimitedUse,
  actionLimitedUse,
}: {
  spellLimitedUse?: unknown
  actionLimitedUse?: unknown
}) {
  const form = useForm({
    defaultValues: { spell: { limitedUse: spellLimitedUse }, limitedUse: actionLimitedUse },
  })
  return (
    <FormProvider {...form}>
      <MonsterSpellFrequencyField spellLimitName="spell.limitedUse" actionLimitName="limitedUse" />
    </FormProvider>
  )
}

export const AtWill: Story = {
  render: () => <Host />,
}

export const SharedPool: Story = {
  render: () => (
    <Host
      actionLimitedUse={{
        kind: 'uses',
        count: { kind: 'fixed', value: 3 },
        recovery: { minimumRest: 'long' },
      }}
    />
  ),
}
