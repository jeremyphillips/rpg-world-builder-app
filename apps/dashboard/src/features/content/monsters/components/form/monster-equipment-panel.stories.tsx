import type { Meta, StoryObj } from '@storybook/react-vite'
import { buildContentPurposeSelectors } from '@rpg/contracts'
import { FormProvider, useForm } from 'react-hook-form'
import { pickEquipment } from '@/test/fixtures/pick'

import { MonsterEquipmentPanel } from './monster-equipment-panel'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'

function Host({
  equipment,
  defaultValues,
  catalogEquipment,
}: {
  equipment?: MonsterFormValues['equipment']
  defaultValues?: Partial<MonsterFormValues>
  catalogEquipment?: ReturnType<typeof pickEquipment>[]
}) {
  const dagger = pickEquipment('dagger')
  const longsword = pickEquipment('longsword')
  const shortsword = pickEquipment('shortsword')
  const shortbow = pickEquipment('shortbow')
  const catalogRows = catalogEquipment ?? [dagger, longsword, shortsword, shortbow]
  const catalog = new Map(catalogRows.map((row) => [row.id, row]))
  const form = useForm<MonsterFormValues>({
    defaultValues: {
      ...resolveMonsterCreateDefaultValues(),
      ...defaultValues,
      equipment: equipment ?? defaultValues?.equipment ?? [],
    },
  })
  return (
    <FormProvider {...form}>
      <MonsterEquipmentPanel
        ctx={{
          equipmentCatalogStatus: 'ready',
          equipmentCatalogById: catalog,
          rulesetId: 'srd-cc-5.2.1',
          options: {
            equipment: buildContentPurposeSelectors(catalogRows),
          },
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
          adjustments: [{ effectId: 'manual', target: 'attack_roll', bonus: 1 }],
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

export const MissingCatalog: Story = {
  render: () => (
    <Host
      equipment={[
        {
          entryId: 'gone',
          equipmentId: 'removed-from-catalog',
          quantity: 1,
          equipped: true,
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

export const RecommendationsEmptyList: Story = {
  render: () => {
    const dagger = pickEquipment('dagger')
    const shortsword = pickEquipment('shortsword')
    const shortbow = pickEquipment('shortbow')
    return (
      <Host
        defaultValues={{
          proficiencies: {
            ...resolveMonsterCreateDefaultValues().proficiencies,
            weapons: { categories: [], items: [dagger.id, shortsword.id, shortbow.id] },
          },
        }}
      />
    )
  },
}

const calculatedCreature = {
  challengeRating: '0' as const,
  abilityScores: {
    ...resolveMonsterCreateDefaultValues().abilityScores,
    str: 16,
    dex: 14,
  },
  weaponProficiencyMode: 'categories' as const,
  proficiencies: {
    ...resolveMonsterCreateDefaultValues().proficiencies,
    weapons: { categories: ['martial' as const, 'simple' as const], items: [] },
  },
}

export const CalculatedOrdinary: Story = {
  render: () => (
    <Host
      defaultValues={calculatedCreature}
      equipment={[
        {
          entryId: 'axe',
          equipmentId: pickEquipment('greataxe').id,
          quantity: 1,
          equipped: true,
        },
      ]}
    />
  ),
}

export const CalculatedMagical: Story = {
  render: () => (
    <Host
      defaultValues={calculatedCreature}
      equipment={[
        {
          entryId: 'enhanced',
          equipmentId: pickEquipment('longsword').id,
          quantity: 1,
          equipped: true,
          magical: true,
          magicProperties: [{ kind: 'preset', propertyId: 'srd-cc-5.2.1:weapon-enhancement-1' }],
        },
      ]}
    />
  ),
}

export const CalculatedAdjusted: Story = {
  render: () => (
    <Host
      defaultValues={calculatedCreature}
      equipment={[
        {
          entryId: 'adjusted',
          equipmentId: pickEquipment('longsword').id,
          quantity: 1,
          equipped: true,
          customName: 'Notched Longsword',
          magical: true,
          magicProperties: [{ kind: 'preset', propertyId: 'srd-cc-5.2.1:weapon-enhancement-1' }],
          adjustments: [{ effectId: 'manual', target: 'damage_roll', bonus: -1 }],
        },
      ]}
    />
  ),
}

export const CalculatedNonproficient: Story = {
  render: () => (
    <Host
      defaultValues={{
        ...calculatedCreature,
        weaponProficiencyMode: 'categories',
        proficiencies: {
          ...calculatedCreature.proficiencies,
          weapons: { categories: [], items: [] },
        },
      }}
      equipment={[
        {
          entryId: 'axe',
          equipmentId: pickEquipment('greataxe').id,
          quantity: 1,
          equipped: true,
        },
      ]}
    />
  ),
}

export const CalculatedIncomplete: Story = {
  render: () => (
    <Host
      equipment={[
        {
          entryId: 'axe',
          equipmentId: pickEquipment('greataxe').id,
          quantity: 1,
          equipped: true,
        },
      ]}
    />
  ),
}

export const CalculatedLongTitle: Story = {
  render: () => (
    <Host
      defaultValues={calculatedCreature}
      equipment={[
        {
          entryId: 'named',
          equipmentId: pickEquipment('greataxe').id,
          quantity: 1,
          equipped: true,
          customName: 'Greataxe of the Unnecessarily Long Ceremonial Procession',
        },
      ]}
    />
  ),
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
}

export const RecommendationsWithOwnedWeapon: Story = {
  render: () => {
    const dagger = pickEquipment('dagger')
    const shortsword = pickEquipment('shortsword')
    const shortbow = pickEquipment('shortbow')
    return (
      <Host
        equipment={[
          {
            entryId: 'owned-dagger',
            equipmentId: dagger.id,
            quantity: 1,
            equipped: true,
          },
        ]}
        defaultValues={{
          proficiencies: {
            ...resolveMonsterCreateDefaultValues().proficiencies,
            weapons: { categories: [], items: [dagger.id, shortsword.id, shortbow.id] },
          },
        }}
      />
    )
  },
}
