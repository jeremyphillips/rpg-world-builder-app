import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterArmorClassPreview } from './monster-armor-class-preview'

const ctx = {
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map(),
  skillCatalogStatus: 'ready',
} satisfies ContentFormCtx

function Host({ values }: { values: MonsterFormValues }) {
  const form = useForm<MonsterFormValues>({ defaultValues: values })
  return (
    <FormProvider {...form}>
      <div className="max-w-xl">
        <MonsterArmorClassPreview ctx={ctx} />
      </div>
    </FormProvider>
  )
}

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterArmorClassPreview',
  component: Host,
} satisfies Meta<typeof Host>

export default meta
type Story = StoryObj<typeof meta>

export const Unarmored: Story = {
  args: { values: resolveMonsterCreateDefaultValues() },
}

export const NaturalArmor: Story = {
  args: {
    values: {
      ...resolveMonsterCreateDefaultValues(),
      abilityScores: { ...resolveMonsterCreateDefaultValues().abilityScores, dex: 15 },
      armorClass: { naturalArmor: true, naturalArmorBonus: 2, useFixedAc: false },
    },
  },
}

export const Narrow: Story = {
  args: { values: resolveMonsterCreateDefaultValues() },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
}
