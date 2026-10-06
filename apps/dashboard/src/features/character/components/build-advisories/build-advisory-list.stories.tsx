import type { Meta, StoryObj } from '@storybook/react-vite'

import { BuildAdvisoryList } from './build-advisory-list'

const meta = {
  title: 'Character/BuildAdvisories/BuildAdvisoryList',
  component: BuildAdvisoryList,
  args: {
    advisories: [
      {
        code: 'equipment_not_proficient',
        subject: {
          kind: 'equipment',
          equipmentId: 'srd-cc-5.2.1:shield',
          label: 'Shield',
          equipmentClass: 'shield',
        },
      },
    ],
  },
} satisfies Meta<typeof BuildAdvisoryList>

export default meta

export const Default: StoryObj<typeof meta> = {}

export const AbilityScoreRequirementUnmet: StoryObj<typeof meta> = {
  args: {
    advisories: [
      {
        code: 'equipment_not_proficient',
        subject: {
          kind: 'equipment',
          equipmentId: 'srd-cc-5.2.1:plate-armor',
          label: 'Plate Armor',
          equipmentClass: 'armor',
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
    ],
  },
}
