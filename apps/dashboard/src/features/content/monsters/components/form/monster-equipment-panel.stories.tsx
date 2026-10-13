import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'
import { pickEquipment } from '@/test/fixtures/pick'

import { MonsterEquipmentPanel } from './monster-equipment-panel'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'

function Host({ equipment }: { equipment?: MonsterFormValues['equipment'] }) {
  const dagger = pickEquipment('dagger')
  const longsword = pickEquipment('longsword')
  const catalog = new Map([
    [dagger.id, dagger],
    [longsword.id, longsword],
  ])
  const form = useForm<MonsterFormValues>({
    defaultValues: {
      ...resolveMonsterCreateDefaultValues(),
      equipment: equipment ?? [],
    },
  })
  return (
    <FormProvider {...form}>
      <MonsterEquipmentPanel
        ctx={{
          equipmentCatalogStatus: 'ready',
          equipmentCatalogById: catalog,
          rulesetId: 'srd-cc-5.2.1',
        }}
      />
    </FormProvider>
  )
}

const meta = {
  title: 'Dashboard/Content/Monsters/MonsterEquipmentPanel',
  component: Host,
} satisfies Meta<typeof Host>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {
  render: () => <Host />,
}

export const PlainStack: Story = {
  render: () => (
    <Host
      equipment={[
        {
          entryId: 'plain',
          equipmentId: pickEquipment('dagger').id,
          quantity: 2,
          equipped: true,
        },
      ]}
    />
  ),
}

export const EnhancementOverlap: Story = {
  render: () => (
    <Host
      equipment={[
        {
          entryId: 'enhanced',
          equipmentId: pickEquipment('longsword').id,
          quantity: 1,
          equipped: true,
          magical: true,
          magicProperties: [{ kind: 'preset', propertyId: 'srd-cc-5.2.1:weapon-enhancement-1' }],
          mechanicalEffects: [{ effectId: 'manual', target: 'attack_roll', bonus: 1 }],
        },
      ]}
    />
  ),
}

export const SplitStacks: Story = {
  render: () => (
    <Host
      equipment={[
        {
          entryId: 'plain-stack',
          equipmentId: pickEquipment('dagger').id,
          quantity: 2,
          equipped: true,
        },
        {
          entryId: 'custom-stack',
          equipmentId: pickEquipment('dagger').id,
          quantity: 1,
          equipped: true,
          magical: true,
          magicProperties: [{ kind: 'preset', propertyId: 'srd-cc-5.2.1:weapon-enhancement-1' }],
        },
      ]}
    />
  ),
}

export const UnresolvedPreset: Story = {
  render: () => (
    <Host
      equipment={[
        {
          entryId: 'bad',
          equipmentId: pickEquipment('longsword').id,
          quantity: 1,
          equipped: true,
          magical: true,
          magicProperties: [{ kind: 'preset', propertyId: 'removed-preset' }],
        },
      ]}
    />
  ),
}

export const Narrow: Story = {
  render: () => <Host />,
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
}
