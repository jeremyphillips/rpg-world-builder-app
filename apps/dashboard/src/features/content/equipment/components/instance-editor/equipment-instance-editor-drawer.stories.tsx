import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo, useState } from 'react'

import { createMagicPropertyDefinitionProvider } from '@rpg/catalog/magic-properties'
import { pickEquipment } from '@/test/fixtures/pick'

import { EquipmentInstanceEditorDrawer } from './equipment-instance-editor-drawer'

const rulesetId = 'srd-cc-5.2.1'
const longsword = pickEquipment('longsword')

function EditorHost({
  sourceEntry,
}: {
  sourceEntry: {
    entryId: string
    equipmentId: string
    quantity: number
    equipped?: boolean
    magical?: boolean
    magicProperties?: Array<
      | { kind: 'preset'; propertyId: string }
      | { kind: 'custom'; customId: string; name: string; description: string }
    >
    mechanicalEffects?: Array<{
      effectId: string
      target: 'attack_roll' | 'damage_roll' | 'armor_class'
      bonus: number
    }>
  }
}) {
  const [open, setOpen] = useState(true)
  const [entries, setEntries] = useState([sourceEntry])
  const provider = useMemo(() => createMagicPropertyDefinitionProvider(rulesetId), [])
  return (
    <EquipmentInstanceEditorDrawer
      open={open}
      onOpenChange={setOpen}
      sourceEntry={sourceEntry}
      entries={entries}
      catalogItem={longsword}
      rulesetId={rulesetId}
      definitions={provider}
      subjectNoun="creature"
      onCommit={(next) => {
        setEntries(next as typeof entries)
        setOpen(false)
      }}
    />
  )
}

const meta = {
  title: 'Dashboard/Content/Equipment/EquipmentInstanceEditorDrawer',
  component: EditorHost,
} satisfies Meta<typeof EditorHost>

export default meta

type Story = StoryObj<typeof meta>

export const PlainWeapon: Story = {
  args: {
    sourceEntry: {
      entryId: 'plain',
      equipmentId: longsword.id,
      quantity: 1,
      equipped: true,
    },
  },
}

export const EnhancementAndManualAttack: Story = {
  args: {
    sourceEntry: {
      entryId: 'plus-one',
      equipmentId: longsword.id,
      quantity: 1,
      equipped: true,
      magical: true,
      magicProperties: [{ kind: 'preset', propertyId: `${rulesetId}:weapon-enhancement-1` }],
      mechanicalEffects: [{ effectId: 'manual', target: 'attack_roll', bonus: 1 }],
    },
  },
}

export const SplitStackScope: Story = {
  args: {
    sourceEntry: {
      entryId: 'stack',
      equipmentId: longsword.id,
      quantity: 3,
      equipped: true,
    },
  },
}

export const UnresolvedPreset: Story = {
  args: {
    sourceEntry: {
      entryId: 'bad-preset',
      equipmentId: longsword.id,
      quantity: 1,
      equipped: true,
      magical: true,
      magicProperties: [{ kind: 'preset', propertyId: 'removed-preset' }],
    },
  },
}

export const CustomProperty: Story = {
  args: {
    sourceEntry: {
      entryId: 'custom',
      equipmentId: longsword.id,
      quantity: 1,
      equipped: true,
      magical: true,
      magicProperties: [
        {
          kind: 'custom',
          customId: 'c1',
          name: 'Moonlit edge',
          description: 'Glows under moonlight.',
        },
      ],
    },
  },
}
