import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { pickEquipment } from '@/test/fixtures/pick'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { createPlainMonsterEquipmentEntry } from '../../lib/equipment/monster-equipment-loadout.lib'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterArmorClassPreview } from './monster-armor-class-preview'

const scaleMail = pickEquipment('scale-mail')
const shield = pickEquipment('shield')

const ctx = {
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map([
    [scaleMail.id, scaleMail],
    [shield.id, shield],
  ]),
  skillCatalogStatus: 'ready',
} satisfies ContentFormCtx

const naturalVersusArmor = [
  createPlainMonsterEquipmentEntry(scaleMail.id),
  createPlainMonsterEquipmentEntry(shield.id),
]

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
      armorClass: { naturalArmorBonus: 2, useFixedAc: false },
    },
  },
}

export const NaturalArmorVersusEquippedArmor: Story = {
  args: {
    values: {
      ...resolveMonsterCreateDefaultValues(),
      abilityScores: { ...resolveMonsterCreateDefaultValues().abilityScores, dex: 18 },
      armorClass: { naturalArmorBonus: 3, useFixedAc: false },
      equipment: naturalVersusArmor,
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
