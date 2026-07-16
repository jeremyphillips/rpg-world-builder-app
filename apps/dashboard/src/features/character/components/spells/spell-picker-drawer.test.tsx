import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { SpellPickerDrawer } from './spell-picker-drawer.client'
import {
  spellPickerCantripChoiceSetFixture,
  spellPickerDetectMagicFixture,
  spellPickerItemsFixture,
  spellPickerMageHandFixture,
  spellPickerOpenItemsFixture,
} from './spell-picker-drawer.fixtures'
import {
  SPELL_PICKER_MODE_CANTRIPS,
  SPELL_PICKER_NO_OPTIONS_MESSAGE,
  SPELL_PICKER_NO_RESULTS_MESSAGE,
  SPELL_PICKER_SELECTION_FULL_MESSAGE,
} from './spell-picker-drawer.types'

function renderCantripDrawer(overrides: Partial<ComponentProps<typeof SpellPickerDrawer>> = {}) {
  const onSelectSpell = vi.fn()
  const onRemoveSpell = vi.fn()

  render(
    <SpellPickerDrawer
      open
      onOpenChange={vi.fn()}
      className="Wizard"
      cantripChoiceSet={spellPickerCantripChoiceSetFixture}
      cantripSelectedIds={[spellPickerMageHandFixture.id, spellPickerDetectMagicFixture.id]}
      preparedSelectedIds={[]}
      cantripItems={spellPickerOpenItemsFixture}
      preparedItems={[]}
      onSelectSpell={onSelectSpell}
      onRemoveSpell={onRemoveSpell}
      {...overrides}
    />,
  )

  return { onSelectSpell, onRemoveSpell }
}

describe('SpellPickerDrawer', () => {
  it('renders search without recommendation tabs, sort toolbar, and ranks rows via searchText', async () => {
    const user = userEvent.setup()

    renderCantripDrawer({
      cantripSelectedIds: [spellPickerMageHandFixture.id, spellPickerDetectMagicFixture.id],
      cantripItems: spellPickerOpenItemsFixture,
    })

    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Sort spells' })).toBeInTheDocument()
    expect(screen.getByText('Mage Hand')).toBeInTheDocument()
    expect(screen.getByText('Detect Magic')).toBeInTheDocument()
    expect(screen.getByText('2 of 2 selected')).toBeInTheDocument()
    expect(screen.getByText(/Wizard cantrips/)).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Search spells' }), 'magic')

    expect(screen.queryByText('Mage Hand')).not.toBeInTheDocument()
    expect(screen.getByText('Detect Magic')).toBeInTheDocument()
  })

  it('shows compact A-Z label in the sort trigger', () => {
    renderCantripDrawer()

    expect(screen.getByRole('combobox', { name: 'Spell sort order' })).toHaveTextContent('A–Z')
  })

  it('disables Add when canSelect is false and keeps selected rows removable', () => {
    renderCantripDrawer({
      cantripSelectedIds: [spellPickerMageHandFixture.id, spellPickerDetectMagicFixture.id],
      cantripItems: spellPickerItemsFixture,
    })

    expect(screen.getAllByRole('button', { name: 'Remove' })).toHaveLength(2)
    expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
  })

  it('calls onSelectSpell and onRemoveSpell from row actions', async () => {
    const user = userEvent.setup()
    const { onSelectSpell, onRemoveSpell: _onRemoveSpell } = renderCantripDrawer({
      cantripSelectedIds: [],
      cantripItems: spellPickerOpenItemsFixture,
    })

    const mageHandRow = screen
      .getByText('Mage Hand')
      .closest('[data-picker-item-key]') as HTMLElement
    await user.click(within(mageHandRow).getByRole('button', { name: 'Add' }))
    expect(onSelectSpell).toHaveBeenCalledWith(
      SPELL_PICKER_MODE_CANTRIPS,
      spellPickerMageHandFixture.id,
    )

    cleanup()

    const removeHarness = renderCantripDrawer({
      cantripSelectedIds: [spellPickerMageHandFixture.id, spellPickerDetectMagicFixture.id],
      cantripItems: spellPickerItemsFixture,
    })

    const removeRow = screen.getByText('Mage Hand').closest('[data-picker-item-key]') as HTMLElement
    await user.click(within(removeRow).getByRole('button', { name: 'Remove' }))
    expect(removeHarness.onRemoveSpell).toHaveBeenCalledWith(
      SPELL_PICKER_MODE_CANTRIPS,
      spellPickerMageHandFixture.id,
    )
  })

  it('shows distinct empty states for no options, no search results, and selection full', async () => {
    const user = userEvent.setup()

    const { rerender } = render(
      <SpellPickerDrawer
        open
        onOpenChange={vi.fn()}
        className="Wizard"
        cantripChoiceSet={spellPickerCantripChoiceSetFixture}
        cantripSelectedIds={[]}
        preparedSelectedIds={[]}
        cantripItems={[]}
        preparedItems={[]}
        onSelectSpell={vi.fn()}
        onRemoveSpell={vi.fn()}
      />,
    )

    expect(screen.getByText(SPELL_PICKER_NO_OPTIONS_MESSAGE)).toBeInTheDocument()

    rerender(
      <SpellPickerDrawer
        open
        onOpenChange={vi.fn()}
        className="Wizard"
        cantripChoiceSet={spellPickerCantripChoiceSetFixture}
        cantripSelectedIds={[spellPickerMageHandFixture.id, spellPickerDetectMagicFixture.id]}
        preparedSelectedIds={[]}
        cantripItems={[]}
        preparedItems={[]}
        onSelectSpell={vi.fn()}
        onRemoveSpell={vi.fn()}
      />,
    )

    expect(screen.getByText(SPELL_PICKER_SELECTION_FULL_MESSAGE)).toBeInTheDocument()

    rerender(
      <SpellPickerDrawer
        open
        onOpenChange={vi.fn()}
        className="Wizard"
        cantripChoiceSet={spellPickerCantripChoiceSetFixture}
        cantripSelectedIds={[]}
        preparedSelectedIds={[]}
        cantripItems={spellPickerOpenItemsFixture}
        preparedItems={[]}
        onSelectSpell={vi.fn()}
        onRemoveSpell={vi.fn()}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: 'Search spells' }), 'zzzz')
    expect(screen.getByText(SPELL_PICKER_NO_RESULTS_MESSAGE)).toBeInTheDocument()
  })

  it('expands spell details from the display view model', async () => {
    const user = userEvent.setup()

    render(
      <SpellPickerDrawer
        open
        onOpenChange={vi.fn()}
        className="Wizard"
        cantripChoiceSet={spellPickerCantripChoiceSetFixture}
        cantripSelectedIds={[]}
        preparedSelectedIds={[]}
        cantripItems={[spellPickerOpenItemsFixture[0]!]}
        preparedItems={[]}
        onSelectSpell={vi.fn()}
        onRemoveSpell={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Expand Mage Hand' }))

    expect(screen.getByText(/spectral, floating hand/i)).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <SpellPickerDrawer
        open
        onOpenChange={vi.fn()}
        className="Wizard"
        cantripChoiceSet={spellPickerCantripChoiceSetFixture}
        cantripSelectedIds={[spellPickerMageHandFixture.id]}
        preparedSelectedIds={[]}
        cantripItems={spellPickerItemsFixture}
        preparedItems={[]}
        onSelectSpell={vi.fn()}
        onRemoveSpell={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
