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
import { SPELL_PICKER_MODE_CANTRIPS } from './spell-picker-drawer.types'

const baseArgs = {
  characterClassName: 'Wizard',
  cantripChoiceSet: spellPickerCantripChoiceSetFixture,
  cantripSelectedIds: [] as string[],
  preparedSelectedIds: [] as string[],
  cantripItems: spellPickerOpenItemsFixture,
  preparedItems: [] as typeof spellPickerOpenItemsFixture,
  onSelectSpell: () => undefined,
  onRemoveSpell: () => undefined,
}

const meta = {
  title: 'Character Builder/SpellPickerDrawer',
  component: SpellPickerDrawer,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SpellPickerDrawer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ...baseArgs,
    open: true,
    onOpenChange: () => undefined,
    initialMode: SPELL_PICKER_MODE_CANTRIPS,
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
    ...baseArgs,
    open: true,
    onOpenChange: () => undefined,
    cantripSelectedIds: [spellPickerMageHandFixture.id, spellPickerDetectMagicFixture.id],
    cantripItems: spellPickerItemsFixture,
  },
}

export const NoOptions: Story = {
  args: {
    ...baseArgs,
    open: true,
    onOpenChange: () => undefined,
    cantripItems: [],
  },
}
