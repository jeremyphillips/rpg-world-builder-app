import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { ProficiencyPickerDrawer } from './proficiency-picker-drawer'
import {
  proficiencyPickerAcrobaticsOptionId,
  proficiencyPickerCatalogIndexFixture,
  proficiencyPickerItemsFixture,
  proficiencyPickerLanguageCatalogIndexFixture,
  proficiencyPickerLanguageChoiceSetFixture,
  proficiencyPickerLanguageItemsFixture,
  proficiencyPickerOpenItemsFixture,
  proficiencyPickerSkillChoiceSetFixture,
  proficiencyPickerStealthOptionId,
} from './proficiency-picker-drawer.fixtures'
import {
  PROFICIENCY_PICKER_NO_OPTIONS_MESSAGE,
  PROFICIENCY_PICKER_NO_RESULTS_MESSAGE,
  PROFICIENCY_PICKER_SELECTION_FULL_MESSAGE,
} from './proficiency-picker-drawer.types'

describe('ProficiencyPickerDrawer', () => {
  it('renders search, sort toolbar, and filters rows by label', async () => {
    const user = userEvent.setup()

    render(
      <ProficiencyPickerDrawer
        open
        onOpenChange={vi.fn()}
        choiceSet={proficiencyPickerSkillChoiceSetFixture}
        selectedIds={[]}
        items={proficiencyPickerOpenItemsFixture}
        catalogIndex={proficiencyPickerCatalogIndexFixture}
        onSelectOption={vi.fn()}
        onRemoveOption={vi.fn()}
      />,
    )

    expect(screen.getByRole('group', { name: 'Sort proficiencies' })).toBeInTheDocument()
    expect(screen.getByText('Stealth')).toBeInTheDocument()
    expect(screen.getAllByText('Dexterity').length).toBeGreaterThan(0)
    expect(screen.getByText('Acrobatics')).toBeInTheDocument()
    expect(screen.getByText('Perception')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Search skills' }), 'stealth')

    expect(screen.getByText('Stealth')).toBeInTheDocument()
    expect(screen.queryByText('Acrobatics')).not.toBeInTheDocument()
    expect(screen.queryByText('Perception')).not.toBeInTheDocument()
  })

  it('disables Add when canSelect is false and keeps selected rows removable', () => {
    render(
      <ProficiencyPickerDrawer
        open
        onOpenChange={vi.fn()}
        choiceSet={proficiencyPickerSkillChoiceSetFixture}
        selectedIds={[proficiencyPickerStealthOptionId, proficiencyPickerAcrobaticsOptionId]}
        items={proficiencyPickerItemsFixture}
        catalogIndex={proficiencyPickerCatalogIndexFixture}
        onSelectOption={vi.fn()}
        onRemoveOption={vi.fn()}
      />,
    )

    expect(screen.getAllByRole('button', { name: 'Remove' })).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
    expect(screen.getByText('Selection full')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Manage skill choices' })).toBeInTheDocument()
  })

  it('calls onSelectOption and onRemoveOption from row actions', async () => {
    const user = userEvent.setup()
    const onSelectOption = vi.fn()
    const onRemoveOption = vi.fn()

    render(
      <ProficiencyPickerDrawer
        open
        onOpenChange={vi.fn()}
        choiceSet={proficiencyPickerSkillChoiceSetFixture}
        selectedIds={[]}
        items={proficiencyPickerOpenItemsFixture}
        catalogIndex={proficiencyPickerCatalogIndexFixture}
        onSelectOption={onSelectOption}
        onRemoveOption={onRemoveOption}
      />,
    )

    const acrobaticsRow = screen
      .getByText('Acrobatics')
      .closest('[data-picker-item-key]') as HTMLElement
    await user.click(within(acrobaticsRow).getByRole('button', { name: 'Add' }))
    expect(onSelectOption).toHaveBeenCalledWith(proficiencyPickerAcrobaticsOptionId)

    cleanup()
    onRemoveOption.mockClear()

    render(
      <ProficiencyPickerDrawer
        open
        onOpenChange={vi.fn()}
        choiceSet={proficiencyPickerSkillChoiceSetFixture}
        selectedIds={[proficiencyPickerStealthOptionId, proficiencyPickerAcrobaticsOptionId]}
        items={proficiencyPickerItemsFixture}
        catalogIndex={proficiencyPickerCatalogIndexFixture}
        onSelectOption={onSelectOption}
        onRemoveOption={onRemoveOption}
      />,
    )

    const stealthRow = screen.getByText('Stealth').closest('[data-picker-item-key]') as HTMLElement
    await user.click(within(stealthRow).getByRole('button', { name: 'Remove' }))
    expect(onRemoveOption).toHaveBeenCalledWith(proficiencyPickerStealthOptionId)
  })

  it('expands skill rows with governing ability and examples', async () => {
    const user = userEvent.setup()

    render(
      <ProficiencyPickerDrawer
        open
        onOpenChange={vi.fn()}
        choiceSet={proficiencyPickerSkillChoiceSetFixture}
        selectedIds={[]}
        items={proficiencyPickerOpenItemsFixture}
        catalogIndex={proficiencyPickerCatalogIndexFixture}
        onSelectOption={vi.fn()}
        onRemoveOption={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Expand Stealth' }))

    const stealthRow = screen.getByText('Stealth').closest('[data-picker-item-key]') as HTMLElement
    expect(within(stealthRow).getByText(/^Governing Ability$/)).toBeInTheDocument()
    expect(within(stealthRow).getAllByText('Dexterity').length).toBeGreaterThanOrEqual(2)
  })

  it('does not render expand controls for language rows', () => {
    render(
      <ProficiencyPickerDrawer
        open
        onOpenChange={vi.fn()}
        choiceSet={proficiencyPickerLanguageChoiceSetFixture}
        selectedIds={[]}
        items={proficiencyPickerLanguageItemsFixture}
        catalogIndex={proficiencyPickerLanguageCatalogIndexFixture}
        onSelectOption={vi.fn()}
        onRemoveOption={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button', { name: /^Expand / })).not.toBeInTheDocument()
  })

  it('shows distinct empty states for no options, no search results, and selection full', async () => {
    const user = userEvent.setup()

    const { rerender } = render(
      <ProficiencyPickerDrawer
        open
        onOpenChange={vi.fn()}
        choiceSet={proficiencyPickerSkillChoiceSetFixture}
        selectedIds={[]}
        items={[]}
        catalogIndex={proficiencyPickerCatalogIndexFixture}
        onSelectOption={vi.fn()}
        onRemoveOption={vi.fn()}
      />,
    )

    expect(screen.getByText(PROFICIENCY_PICKER_NO_OPTIONS_MESSAGE)).toBeInTheDocument()

    rerender(
      <ProficiencyPickerDrawer
        open
        onOpenChange={vi.fn()}
        choiceSet={proficiencyPickerSkillChoiceSetFixture}
        selectedIds={[proficiencyPickerStealthOptionId, proficiencyPickerAcrobaticsOptionId]}
        items={[]}
        catalogIndex={proficiencyPickerCatalogIndexFixture}
        onSelectOption={vi.fn()}
        onRemoveOption={vi.fn()}
      />,
    )

    expect(screen.getByText(PROFICIENCY_PICKER_SELECTION_FULL_MESSAGE)).toBeInTheDocument()

    rerender(
      <ProficiencyPickerDrawer
        open
        onOpenChange={vi.fn()}
        choiceSet={proficiencyPickerSkillChoiceSetFixture}
        selectedIds={[]}
        items={proficiencyPickerOpenItemsFixture}
        catalogIndex={proficiencyPickerCatalogIndexFixture}
        onSelectOption={vi.fn()}
        onRemoveOption={vi.fn()}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: 'Search skills' }), 'zzzz')
    expect(screen.getByText(PROFICIENCY_PICKER_NO_RESULTS_MESSAGE)).toBeInTheDocument()
  })

  it('renders language picker rows with language search placeholder', async () => {
    const user = userEvent.setup()

    render(
      <ProficiencyPickerDrawer
        open
        onOpenChange={vi.fn()}
        choiceSet={proficiencyPickerLanguageChoiceSetFixture}
        selectedIds={[]}
        items={proficiencyPickerLanguageItemsFixture}
        catalogIndex={proficiencyPickerLanguageCatalogIndexFixture}
        onSelectOption={vi.fn()}
        onRemoveOption={vi.fn()}
      />,
    )

    expect(screen.getByRole('textbox', { name: 'Search languages' })).toBeInTheDocument()
    expect(screen.getByText('Common')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Search languages' }), 'elvish')
    expect(screen.getByText('Elvish')).toBeInTheDocument()
    expect(screen.queryByText('Common')).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <ProficiencyPickerDrawer
        open
        onOpenChange={vi.fn()}
        choiceSet={proficiencyPickerSkillChoiceSetFixture}
        selectedIds={[proficiencyPickerStealthOptionId]}
        items={proficiencyPickerItemsFixture}
        catalogIndex={proficiencyPickerCatalogIndexFixture}
        onSelectOption={vi.fn()}
        onRemoveOption={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
