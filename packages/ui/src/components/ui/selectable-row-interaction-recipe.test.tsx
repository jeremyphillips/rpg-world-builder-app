import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button.client'
import { ComboboxOptionRow } from './combobox-option-row.client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu.client'
import { InteractiveListRow } from './interactive-list-row.client'
import { MenuChoiceRow } from './menu-choice-row.client'
import {
  interactiveListRowChromeVariants,
  menuChoiceItemResetVariants,
} from './interactive-list.variants'
import {
  selectableRowHighlightFillClasses,
  selectableRowMenuHighlightFillClasses,
  selectableRowPointerHoverClasses,
} from './interactive-row.variants'

const FORBIDDEN_HOVER_TOKENS = ['control-hover', 'hover:bg-accent', 'focus:bg-accent'] as const

function assertSelectableRowRecipe(className: string) {
  expect(className).toContain('row-hover')
  for (const token of FORBIDDEN_HOVER_TOKENS) {
    expect(className).not.toContain(token)
  }
}

describe('selectable row interaction recipe (SSOT)', () => {
  it('exports row-hover fills without control-hover', () => {
    assertSelectableRowRecipe(selectableRowPointerHoverClasses)
    assertSelectableRowRecipe(selectableRowHighlightFillClasses)
    assertSelectableRowRecipe(selectableRowMenuHighlightFillClasses)
  })

  it('encodes list row chrome with row-hover highlight and menu highlight', () => {
    assertSelectableRowRecipe(
      interactiveListRowChromeVariants({ host: 'row', highlighted: true, interactive: true }),
    )
    assertSelectableRowRecipe(
      interactiveListRowChromeVariants({ host: 'menuitem', interactive: false }),
    )
  })

  it('resets menu item control styling before selectable-row chrome', () => {
    const reset = menuChoiceItemResetVariants()
    expect(reset).toContain('focus:bg-transparent')
    expect(reset).not.toContain('focus:bg-accent')
    expect(reset).not.toContain('control-hover')
  })
})

describe('selectable row interaction recipe (hosts)', () => {
  it('InteractiveListRow uses row-hover for pointer hover', () => {
    const { container } = render(<InteractiveListRow name="Fireball" />)
    assertSelectableRowRecipe(container.firstElementChild?.className ?? '')
  })

  it('InteractiveListRow uses row-hover when highlighted (combobox/search listbox path)', () => {
    const { container } = render(<InteractiveListRow name="Fireball" highlighted />)
    assertSelectableRowRecipe(container.firstElementChild?.className ?? '')
    expect(container.firstElementChild).toHaveClass('bg-row-hover')
  })

  it('ComboboxOptionRow shell uses row-hover when highlighted', () => {
    render(
      <ComboboxOptionRow
        optionId="opt"
        heading="Option"
        selected={false}
        highlighted
        onSelect={vi.fn()}
      />,
    )
    const option = screen.getByRole('option', { name: 'Option' })
    const shell = option.parentElement
    assertSelectableRowRecipe(shell?.className ?? '')
  })

  it('MenuChoiceRow uses row-hover menu highlight recipe', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button type="button">Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <MenuChoiceRow heading="Choice" supporting="Details" onSelect={() => {}} />
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    const item = screen.getByRole('menuitem', { name: /Choice/i })
    assertSelectableRowRecipe(item.className)
    expect(item.className).toContain('data-[highlighted]:bg-row-hover')
    expect(item.className).toContain('px-3')
    expect(item.className).toContain('py-2')
  })

  it('search-style link row composes InteractiveListRow hover recipe', () => {
    const { container } = render(
      <InteractiveListRow name="Fireball" classification="Spell" asChild>
        <a href="/example">Navigate</a>
      </InteractiveListRow>,
    )
    assertSelectableRowRecipe(container.firstElementChild?.className ?? '')
  })
})
