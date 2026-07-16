import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Button } from '@rpg/ui'

import { SpellPickerDrawer } from './spell-picker-drawer.client'
import {
  spellPickerCantripChoiceSetFixture,
  spellPickerDetectMagicFixture,
  spellPickerItemsFixture,
  spellPickerMageHandFixture,
  spellPickerOpenItemsFixture,
} from './spell-picker-drawer.fixtures'

const meta = {
  title: 'Character Builder/SpellPickerDrawer',
  component: SpellPickerDrawer,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SpellPickerDrawer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    choiceSet: spellPickerCantripChoiceSetFixture,
    selectedIds: [],
    items: spellPickerOpenItemsFixture,
    onSelectSpell: () => undefined,
    onRemoveSpell: () => undefined,
  },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open)

    return (
      <>
        <Button className="m-8" onClick={() => setOpen(true)}>
          Open spell picker
        </Button>
        <SpellPickerDrawer {...args} open={open} onOpenChange={setOpen} />
      </>
    )
  },
}

export const SelectionFull: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    choiceSet: spellPickerCantripChoiceSetFixture,
    selectedIds: [spellPickerMageHandFixture.id, spellPickerDetectMagicFixture.id],
    items: spellPickerItemsFixture,
    onSelectSpell: () => undefined,
    onRemoveSpell: () => undefined,
  },
}

export const NoOptions: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    choiceSet: spellPickerCantripChoiceSetFixture,
    selectedIds: [],
    items: [],
    onSelectSpell: () => undefined,
    onRemoveSpell: () => undefined,
  },
}
