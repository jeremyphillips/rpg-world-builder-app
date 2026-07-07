import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Button } from '@rpg/ui'

import { ProficiencyPickerDrawer } from './proficiency-picker-drawer.client'
import {
  proficiencyPickerAcrobaticsOptionId,
  proficiencyPickerItemsFixture,
  proficiencyPickerLanguageChoiceSetFixture,
  proficiencyPickerLanguageItemsFixture,
  proficiencyPickerOpenItemsFixture,
  proficiencyPickerSkillChoiceSetFixture,
  proficiencyPickerStealthOptionId,
} from './proficiency-picker-drawer.fixtures'

const meta = {
  title: 'Character Builder/ProficiencyPickerDrawer',
  component: ProficiencyPickerDrawer,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ProficiencyPickerDrawer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    choiceSet: proficiencyPickerSkillChoiceSetFixture,
    selectedIds: [],
    items: proficiencyPickerOpenItemsFixture,
    onSelectOption: () => undefined,
    onRemoveOption: () => undefined,
  },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open)

    return (
      <>
        <Button className="m-8" onClick={() => setOpen(true)}>
          Open proficiency picker
        </Button>
        <ProficiencyPickerDrawer {...args} open={open} onOpenChange={setOpen} />
      </>
    )
  },
}

export const SelectionFull: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    choiceSet: proficiencyPickerSkillChoiceSetFixture,
    selectedIds: [proficiencyPickerStealthOptionId, proficiencyPickerAcrobaticsOptionId],
    items: proficiencyPickerItemsFixture,
    onSelectOption: () => undefined,
    onRemoveOption: () => undefined,
  },
}

export const NoOptions: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    choiceSet: proficiencyPickerSkillChoiceSetFixture,
    selectedIds: [],
    items: [],
    onSelectOption: () => undefined,
    onRemoveOption: () => undefined,
  },
}

export const OriginLanguages: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    choiceSet: proficiencyPickerLanguageChoiceSetFixture,
    selectedIds: [],
    items: proficiencyPickerLanguageItemsFixture,
    onSelectOption: () => undefined,
    onRemoveOption: () => undefined,
  },
}
