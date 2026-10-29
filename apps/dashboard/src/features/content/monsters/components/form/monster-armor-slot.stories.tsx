import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'

import { pickEquipment } from '@/test/fixtures/pick'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { createPlainMonsterEquipmentEntry } from '../../lib/equipment/monster-equipment-loadout.lib'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterArmorSlotBody } from './monster-armor-slot'

const leather = pickEquipment('leather-armor')

const ctx = {
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map([[leather.id, leather]]),
  skillCatalogStatus: 'ready',
} satisfies ContentFormCtx

function Host({ withArmor }: { withArmor: boolean }) {
  const defaults = resolveMonsterCreateDefaultValues()
  if (withArmor) defaults.equipment = [createPlainMonsterEquipmentEntry(leather.id)]
  const form = useForm<MonsterFormValues>({ defaultValues: defaults })
  return (
    <FormProvider {...form}>
      <div className="max-w-xl">
        <MonsterArmorSlotBody slot="body-armor" ctx={ctx} />
      </div>
    </FormProvider>
  )
}

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterArmorSlot',
  component: Host,
} satisfies Meta<typeof Host>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: { withArmor: false },
}

export const Selected: Story = {
  args: { withArmor: true },
}
