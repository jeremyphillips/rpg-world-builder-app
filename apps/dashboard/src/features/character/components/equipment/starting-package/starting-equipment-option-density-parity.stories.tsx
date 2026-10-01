import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  Button,
  RadioGroup,
  RadioOptionCard,
  SelectionOptionCard,
  SelectionOptionCardHeaderAction,
} from '@rpg/ui'

import {
  EQUIPMENT_CHANGE_PACKAGE_LABEL,
  EQUIPMENT_SELECTED_PACKAGE_EYEBROW,
} from '../../../lib/equipment/equipment-step.lib'

const PACKAGE_LABEL = 'Heavy Armor'
const PACKAGE_DESCRIPTION =
  "Chain Mail, Greatsword, Flail, 8 Javelins, Dungeoneer's Pack, and 4 GP."
const PACKAGE_SUMMARY_LINES = ['Gold remaining: 4 gp']

/**
 * Starting equipment chooser → selected transition at **compact** density.
 * Typography and rhythm should stay stable; structure may differ (no radio, summary shell, Change action).
 */
function StartingEquipmentDensityParityDemo() {
  const [selected, setSelected] = React.useState(false)

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setSelected((value) => !value)}
      >
        {selected ? 'Show chooser (radio)' : 'Show selected summary'}
      </Button>

      {selected ? (
        <SelectionOptionCard
          selected
          density="compact"
          headerEyebrow={EQUIPMENT_SELECTED_PACKAGE_EYEBROW}
          headerEndSlot={
            <SelectionOptionCardHeaderAction
              label={EQUIPMENT_CHANGE_PACKAGE_LABEL}
              onClick={() => setSelected(false)}
            />
          }
          label={PACKAGE_LABEL}
          description={PACKAGE_DESCRIPTION}
          summaryLines={PACKAGE_SUMMARY_LINES}
        />
      ) : (
        <RadioGroup aria-label="Starting equipment package" value="heavy-armor">
          <RadioOptionCard
            value="heavy-armor"
            label={PACKAGE_LABEL}
            description={PACKAGE_DESCRIPTION}
            summaryLines={PACKAGE_SUMMARY_LINES}
            density="compact"
          />
        </RadioGroup>
      )}
    </div>
  )
}

const meta = {
  title: 'Character Builder/StartingEquipmentOptionDensityParity',
  component: StartingEquipmentDensityParityDemo,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof StartingEquipmentDensityParityDemo>

export default meta
type Story = StoryObj<typeof meta>

export const CompactChooserToSelected: Story = {}
