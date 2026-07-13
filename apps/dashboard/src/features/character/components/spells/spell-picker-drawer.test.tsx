import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  SPELL_PICKER_NO_OPTIONS_MESSAGE,
  SPELL_PICKER_NO_RESULTS_MESSAGE,
  SPELL_PICKER_SELECTION_FULL_MESSAGE,
} from './spell-picker-drawer.types'

describe('SpellPickerDrawer', () => {
  it('renders search without tabs, sort toolbar, and ranks rows via searchText', async () => {
    const user = userEvent.setup()

    render(
      <SpellPickerDrawer
        open
        onOpenChange={vi.fn()}
        choiceSet={spellPickerCantripChoiceSetFixture}
        selectedIds={[spellPickerMageHandFixture.id, spellPickerDetectMagicFixture.id]}
        items={spellPickerOpenItemsFixture}
        onSelectSpell={vi.fn()}
        onRemoveSpell={vi.fn()}
      />,
    )

    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Sort spells' })).toBeInTheDocument()
    expect(screen.getByText('Mage Hand')).toBeInTheDocument()
    expect(screen.getByText('Detect Magic')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Search spells' }), 'cure')

    expect(screen.queryByText('Mage Hand')).not.toBeInTheDocument()
    expect(screen.getByText('Cure Wounds')).toBeInTheDocument()
  })

  it('disables Add when canSelect is false and keeps selected rows removable', () => {
    render(
      <SpellPickerDrawer
        open
        onOpenChange={vi.fn()}
        choiceSet={spellPickerCantripChoiceSetFixture}
        selectedIds={[spellPickerMageHandFixture.id, spellPickerDetectMagicFixture.id]}
        items={spellPickerItemsFixture}
        onSelectSpell={vi.fn()}
        onRemoveSpell={vi.fn()}
      />,
    )

    expect(screen.getAllByRole('button', { name: 'Remove' })).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
    expect(screen.getByText('Selection full')).toBeInTheDocument()
  })

  it('calls onSelectSpell and onRemoveSpell from row actions', async () => {
    const user = userEvent.setup()
    const onSelectSpell = vi.fn()
    const onRemoveSpell = vi.fn()

    render(
      <SpellPickerDrawer
        open
        onOpenChange={vi.fn()}
        choiceSet={spellPickerCantripChoiceSetFixture}
        selectedIds={[]}
        items={spellPickerOpenItemsFixture}
        onSelectSpell={onSelectSpell}
        onRemoveSpell={onRemoveSpell}
      />,
    )

    const mageHandRow = screen
      .getByText('Mage Hand')
      .closest('[data-picker-item-key]') as HTMLElement
    await user.click(within(mageHandRow).getByRole('button', { name: 'Add' }))
    expect(onSelectSpell).toHaveBeenCalledWith(spellPickerMageHandFixture.id)

    cleanup()

    render(
      <SpellPickerDrawer
        open
        onOpenChange={vi.fn()}
        choiceSet={spellPickerCantripChoiceSetFixture}
        selectedIds={[spellPickerMageHandFixture.id, spellPickerDetectMagicFixture.id]}
        items={spellPickerItemsFixture}
        onSelectSpell={onSelectSpell}
        onRemoveSpell={onRemoveSpell}
      />,
    )

    const removeRow = screen.getByText('Mage Hand').closest('[data-picker-item-key]') as HTMLElement
    await user.click(within(removeRow).getByRole('button', { name: 'Remove' }))
    expect(onRemoveSpell).toHaveBeenCalledWith(spellPickerMageHandFixture.id)
  })

  it('shows distinct empty states for no options, no search results, and selection full', async () => {
    const user = userEvent.setup()

    const { rerender } = render(
      <SpellPickerDrawer
        open
        onOpenChange={vi.fn()}
        choiceSet={spellPickerCantripChoiceSetFixture}
        selectedIds={[]}
        items={[]}
        onSelectSpell={vi.fn()}
        onRemoveSpell={vi.fn()}
      />,
    )

    expect(screen.getByText(SPELL_PICKER_NO_OPTIONS_MESSAGE)).toBeInTheDocument()

    rerender(
      <SpellPickerDrawer
        open
        onOpenChange={vi.fn()}
        choiceSet={spellPickerCantripChoiceSetFixture}
        selectedIds={[spellPickerMageHandFixture.id, spellPickerDetectMagicFixture.id]}
        items={[]}
        onSelectSpell={vi.fn()}
        onRemoveSpell={vi.fn()}
      />,
    )

    expect(screen.getByText(SPELL_PICKER_SELECTION_FULL_MESSAGE)).toBeInTheDocument()

    rerender(
      <SpellPickerDrawer
        open
        onOpenChange={vi.fn()}
        choiceSet={spellPickerCantripChoiceSetFixture}
        selectedIds={[]}
        items={spellPickerOpenItemsFixture}
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
        choiceSet={spellPickerCantripChoiceSetFixture}
        selectedIds={[]}
        items={[spellPickerItemsFixture[2]!]}
        onSelectSpell={vi.fn()}
        onRemoveSpell={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Expand Cure Wounds' }))

    expect(screen.getByRole('heading', { name: 'At higher levels' })).toBeInTheDocument()
    expect(screen.getByText(/Using a Higher-Level Spell Slot/i)).toBeInTheDocument()
    expect(screen.getByText(/^Components$/)).toBeInTheDocument()
    expect(screen.getByText(/2d8 \+ modifier Hit Points/i)).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <SpellPickerDrawer
        open
        onOpenChange={vi.fn()}
        choiceSet={spellPickerCantripChoiceSetFixture}
        selectedIds={[spellPickerMageHandFixture.id]}
        items={spellPickerItemsFixture}
        onSelectSpell={vi.fn()}
        onRemoveSpell={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
