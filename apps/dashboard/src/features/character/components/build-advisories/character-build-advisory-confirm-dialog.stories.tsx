import type { Meta, StoryObj } from '@storybook/react-vite'
import { action } from 'storybook/actions'

import type { CharacterBuildAdvisory } from '@rpg/contracts'

import { CharacterBuildAdvisoryConfirmDialog } from './character-build-advisory-confirm-dialog'

const advisories: CharacterBuildAdvisory[] = [
  {
    code: 'equipment_not_proficient',
    subject: {
      kind: 'equipment',
      equipmentId: 'srd-cc-5.2.1:chain-mail',
      label: 'Chain Mail',
      equipmentClass: 'armor',
    },
  },
  {
    code: 'equipment_not_proficient',
    subject: {
      kind: 'equipment',
      equipmentId: 'srd-cc-5.2.1:greatsword',
      label: 'Greatsword',
      equipmentClass: 'weapon',
    },
  },
  {
    code: 'equipment_ability_score_requirement_unmet',
    subject: {
      kind: 'equipment',
      equipmentId: 'srd-cc-5.2.1:plate-armor',
      label: 'Plate Armor',
      unmet: [{ ability: 'str', required: 15, actual: 12 }],
    },
  },
]

const meta = {
  title: 'Character/BuildAdvisories/CharacterBuildAdvisoryConfirmDialog',
  component: CharacterBuildAdvisoryConfirmDialog,
  args: {
    open: true,
    characterKind: 'pc',
    advisories,
    onConfirm: action('confirm'),
    onCancel: action('cancel'),
  },
} satisfies Meta<typeof CharacterBuildAdvisoryConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Character: Story = {}

export const Npc: Story = { args: { characterKind: 'npc' } }
