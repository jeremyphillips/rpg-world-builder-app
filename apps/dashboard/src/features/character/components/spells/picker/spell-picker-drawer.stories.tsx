import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { Button } from '@rpg/ui'

import { SpellPickerDrawer } from './spell-picker-drawer'
import {
  spellPickerCantripChoiceSetFixture,
  spellPickerDetectMagicFixture,
  spellPickerItemsFixture,
  spellPickerMageHandFixture,
  spellPickerOpenItemsFixture,
} from './spell-picker-drawer.fixtures'
import {
  SPELL_PICKER_MECHANICS_FILTER_TRIGGER_ARIA_LABEL,
  SPELL_PICKER_MODE_CANTRIPS,
  SPELL_PICKER_MODE_SPELLS,
} from './spell-picker-drawer.types'

const baseArgs = {
  characterClassName: 'Wizard',
  cantripChoiceSet: spellPickerCantripChoiceSetFixture,
  cantripSelectedIds: [] as string[],
  spellSelectedIds: [] as string[],
  cantripItems: spellPickerOpenItemsFixture,
  spellItems: [] as typeof spellPickerOpenItemsFixture,
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body)
    const school = canvas.getByRole('combobox', { name: 'School' })
    const schoolWidth = school.getBoundingClientRect().width
    await expect(schoolWidth).toBeGreaterThan(0)
    await userEvent.click(school)
    await userEvent.click(canvas.getByRole('option', { name: 'Evocation' }))
    await expect(
      canvas.getByRole('combobox', { name: 'School' }).getBoundingClientRect().width,
    ).toBe(schoolWidth)

    const sort = canvas.getByRole('button', { name: 'Sort by, Name: A–Z' })
    const sortWidth = sort.getBoundingClientRect().width
    await expect(sortWidth).toBeGreaterThan(0)
    await userEvent.click(sort)
    await userEvent.click(canvas.getByRole('menuitemradio', { name: 'High to low' }))
    await expect(
      canvas.getByRole('button', { name: 'Sort by, Level: High' }).getBoundingClientRect().width,
    ).toBe(sortWidth)

    const mechanics = canvas.getByRole('button', {
      name: SPELL_PICKER_MECHANICS_FILTER_TRIGGER_ARIA_LABEL,
    })
    const mechanicsWidth = mechanics.getBoundingClientRect().width
    await expect(mechanicsWidth).toBeGreaterThan(0)
    await userEvent.click(mechanics)
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Concentration' }))
    await expect(
      canvas
        .getByRole('button', { name: SPELL_PICKER_MECHANICS_FILTER_TRIGGER_ARIA_LABEL })
        .getBoundingClientRect().width,
    ).toBe(mechanicsWidth)
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

export const Recommended: Story = {
  args: {
    ...baseArgs,
    open: true,
    onOpenChange: () => undefined,
    recommendationsEnabled: true,
    cantripItems: spellPickerOpenItemsFixture.map((item, index) =>
      index === 0
        ? {
            ...item,
            state: {
              ...item.state,
              isRecommended: true,
              presentation: {
                facts: [
                  {
                    kind: 'recommendation' as const,
                    discriminator: 'recommended' as const,
                    label: 'Recommended by class',
                    sourceKind: 'class' as const,
                    sourceLabels: ['Wizard class'],
                  },
                ],
              },
            },
          }
        : item,
    ),
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

const spellChoiceSet = {
  ...spellPickerCantripChoiceSetFixture,
  id: 'spellcasting:srd-cc-5.2.1:cleric:prepared',
  choiceType: 'spell' as const,
  label: 'Prepared spells',
}

export const Prepared: Story = {
  args: {
    ...baseArgs,
    characterClassName: 'Cleric',
    cantripChoiceSet: undefined,
    spellChoiceSet,
    cantripItems: [],
    spellItems: spellPickerOpenItemsFixture,
    open: true,
    onOpenChange: () => undefined,
    initialMode: SPELL_PICKER_MODE_SPELLS,
  },
  render: function Render(args) {
    const [open, setOpen] = useState(true)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const spellItems = spellPickerOpenItemsFixture
      .filter((item) => item.spell.level >= 1)
      .map((item) => ({
        ...item,
        state: {
          ...item.state,
          isAlreadySelected: selectedIds.includes(item.spell.id),
        },
      }))

    return (
      <SpellPickerDrawer
        {...args}
        open={open}
        onOpenChange={setOpen}
        spellItems={spellItems}
        spellSelectedIds={selectedIds}
        onSelectSpell={(_mode, spellId) => {
          setSelectedIds((current) => (current.includes(spellId) ? current : [...current, spellId]))
        }}
        onRemoveSpell={(_mode, spellId) => {
          setSelectedIds((current) => current.filter((id) => id !== spellId))
        }}
      />
    )
  },
}
