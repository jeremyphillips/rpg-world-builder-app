import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import {
  SPELL_PICKER_ACTION_PREPARE,
  SPELL_PICKER_ACTION_UNPREPARE,
} from './spell-picker-action.lib'
import { SpellPickerDrawer } from './spell-picker-drawer'
import {
  spellPickerCantripChoiceSetFixture,
  spellPickerCureWoundsFixture,
  spellPickerDetectMagicFixture,
  spellPickerItemsFixture,
  spellPickerMageHandFixture,
  spellPickerOpenItemsFixture,
} from './spell-picker-drawer.fixtures'
import {
  SPELL_PICKER_MODE_CANTRIPS,
  SPELL_PICKER_MODE_PREPARED_SPELLS,
  SPELL_PICKER_NO_OPTIONS_MESSAGE,
  SPELL_PICKER_NO_RESULTS_MESSAGE,
  SPELL_PICKER_SELECTION_FULL_MESSAGE,
} from './spell-picker-drawer.types'

const preparedSpellChoiceSet = {
  ...spellPickerCantripChoiceSetFixture,
  id: 'spellcasting:srd-cc-5.2.1:cleric:prepared',
  choiceType: 'spell' as const,
  label: 'Prepared spells',
}

function renderCantripDrawer(overrides: Partial<ComponentProps<typeof SpellPickerDrawer>> = {}) {
  const onSelectSpell = vi.fn()
  const onRemoveSpell = vi.fn()

  render(
    <SpellPickerDrawer
      open
      onOpenChange={vi.fn()}
      characterClassName="Wizard"
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

  it('omits the primary toolbar row when level chips are hidden', () => {
    renderCantripDrawer()

    expect(document.querySelector('[data-slot="catalog-toolbar-primary"]')).toBeNull()
  })

  it('filters rows when a casting and mechanics checkbox is selected', async () => {
    const user = userEvent.setup()
    renderCantripDrawer({
      cantripSelectedIds: [],
      cantripItems: spellPickerOpenItemsFixture,
    })

    await user.click(screen.getByRole('button', { name: 'Casting and mechanics filters' }))
    await user.click(screen.getByRole('checkbox', { name: 'Ritual' }))

    expect(screen.getByRole('checkbox', { name: 'Ritual' })).toBeChecked()
    expect(screen.getByText('Detect Magic')).toBeInTheDocument()
    expect(screen.queryByText('Mage Hand')).not.toBeInTheDocument()
  })

  it('shows recommendation guidance and a capacity notice on one metadata line', () => {
    const recommendedItem = {
      ...spellPickerOpenItemsFixture[0]!,
      state: {
        ...spellPickerOpenItemsFixture[0]!.state,
        isRecommended: true,
        recommendation: {
          strength: 'strong' as const,
          signals: [
            {
              strength: 'strong' as const,
              basis: 'authored' as const,
              specificity: 'exact' as const,
              source: { kind: 'class' as const, id: 'srd-cc-5.2.1:wizard' },
            },
          ],
        },
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
    const blockedItem = {
      ...spellPickerOpenItemsFixture[1]!,
      state: {
        ...spellPickerOpenItemsFixture[1]!.state,
        canSelect: false,
        isSelectionFull: true,
        disabledReasons: ['Selection full'],
        presentation: recommendedItem.state.presentation,
      },
    }

    renderCantripDrawer({
      recommendationsEnabled: true,
      cantripSelectedIds: [],
      cantripItems: [recommendedItem, blockedItem],
    })

    const mageHandRow = screen
      .getByText('Mage Hand')
      .closest('[data-picker-item-key]') as HTMLElement
    const guidance = within(mageHandRow).getByText('Recommended by class')
    expect(guidance.tagName).toBe('SPAN')
    expect(guidance).toHaveClass('text-foreground')
    expect(guidance).toHaveAttribute('title', 'Wizard class')
    expect(within(mageHandRow).queryByText('Selection full')).not.toBeInTheDocument()

    const blockedRow = screen
      .getByText('Detect Magic')
      .closest('[data-picker-item-key]') as HTMLElement
    expect(within(blockedRow).getByText('Recommended by class')).toBeInTheDocument()
    expect(within(blockedRow).getByText('Selection full')).toBeInTheDocument()
    const statusLine = blockedRow.querySelector('[data-entity-summary-status]')?.parentElement
      ?.parentElement
    expect(statusLine?.querySelectorAll('[data-inline-metadata-separator]')).toHaveLength(1)
  })

  it('disables Add when canSelect is false and keeps selected rows removable', () => {
    renderCantripDrawer({
      cantripSelectedIds: [spellPickerMageHandFixture.id, spellPickerDetectMagicFixture.id],
      cantripItems: spellPickerItemsFixture,
    })

    expect(screen.getAllByRole('button', { name: 'Remove' })).toHaveLength(2)
    expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
  })

  it('labels prepared rows Prepare and selected rows Unprepare', async () => {
    const user = userEvent.setup()
    const onSelectSpell = vi.fn()
    const onRemoveSpell = vi.fn()

    render(
      <SpellPickerDrawer
        open
        onOpenChange={vi.fn()}
        characterClassName="Cleric"
        preparedChoiceSet={preparedSpellChoiceSet}
        cantripSelectedIds={[]}
        preparedSelectedIds={[]}
        cantripItems={[]}
        preparedItems={spellPickerOpenItemsFixture}
        initialMode={SPELL_PICKER_MODE_PREPARED_SPELLS}
        onSelectSpell={onSelectSpell}
        onRemoveSpell={onRemoveSpell}
      />,
    )

    const cureWoundsRow = screen
      .getByText('Cure Wounds')
      .closest('[data-picker-item-key]') as HTMLElement
    await user.click(
      within(cureWoundsRow).getByRole('button', { name: SPELL_PICKER_ACTION_PREPARE }),
    )
    expect(onSelectSpell).toHaveBeenCalledWith(
      SPELL_PICKER_MODE_PREPARED_SPELLS,
      spellPickerCureWoundsFixture.id,
    )

    cleanup()

    const selectedCureWounds = {
      ...spellPickerOpenItemsFixture[2]!,
      state: {
        ...spellPickerOpenItemsFixture[2]!.state,
        isAlreadySelected: true,
      },
    }

    render(
      <SpellPickerDrawer
        open
        onOpenChange={vi.fn()}
        characterClassName="Cleric"
        preparedChoiceSet={preparedSpellChoiceSet}
        cantripSelectedIds={[]}
        preparedSelectedIds={[spellPickerCureWoundsFixture.id]}
        cantripItems={[]}
        preparedItems={[selectedCureWounds]}
        initialMode={SPELL_PICKER_MODE_PREPARED_SPELLS}
        onSelectSpell={vi.fn()}
        onRemoveSpell={onRemoveSpell}
      />,
    )

    const selectedRow = screen
      .getByText('Cure Wounds')
      .closest('[data-picker-item-key]') as HTMLElement
    await user.click(
      within(selectedRow).getByRole('button', { name: SPELL_PICKER_ACTION_UNPREPARE }),
    )
    expect(onRemoveSpell).toHaveBeenCalledWith(
      SPELL_PICKER_MODE_PREPARED_SPELLS,
      spellPickerCureWoundsFixture.id,
    )
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
        characterClassName="Wizard"
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
        characterClassName="Wizard"
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
        characterClassName="Wizard"
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
        characterClassName="Wizard"
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

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <SpellPickerDrawer
        open
        onOpenChange={vi.fn()}
        characterClassName="Wizard"
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
