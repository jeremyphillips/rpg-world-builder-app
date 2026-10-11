import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { MonsterCreatureDetailsPanel } from './monster-creature-details-panel'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'

function Host() {
  const form = useForm<MonsterFormValues>({ defaultValues: resolveMonsterCreateDefaultValues() })
  return (
    <FormProvider {...form}>
      <MonsterCreatureDetailsPanel
        ctx={{ skillCatalogStatus: 'ready', equipmentCatalogStatus: 'ready' }}
      />
    </FormProvider>
  )
}

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterCreatureDetailsPanel',
  component: Host,
} satisfies Meta<typeof Host>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
}
