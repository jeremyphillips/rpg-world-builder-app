import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button.client'
import { ComboboxOptionRow } from './combobox-option-row.client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu.client'
import { InteractiveListRow } from './interactive-list-row.client'
import { MenuChoiceRow } from './menu-choice-row.client'
import { interactiveListRowChromeVariants } from './interactive-list.variants'
import {
  selectableRowHighlightFillClasses,
  selectableRowListPointerHoverClasses,
  selectableRowPointerHoverClasses,
} from './interactive-row.variants'

const FORBIDDEN_HOVER_TOKENS = ['control-hover', 'hover:bg-accent', 'focus:bg-accent'] as const

function assertNoForbiddenHoverTokens(className: string) {
  for (const token of FORBIDDEN_HOVER_TOKENS) {
    expect(className).not.toContain(token)
  }
}

function assertListRowRecipe(className: string) {
  expect(className).toMatch(/ui-interactive-row--(hover|highlight-list|highlight-list-selected)/)
  assertNoForbiddenHoverTokens(className)
}

function assertEditorRowRecipe(className: string) {
  expect(className).toMatch(/ui-interactive-row--(hover|highlight)/)
  assertNoForbiddenHoverTokens(className)
}

describe('selectable row interaction recipe (SSOT)', () => {
  it('exports row-hover fills without control-hover', () => {
    assertEditorRowRecipe(selectableRowPointerHoverClasses)
    assertEditorRowRecipe(selectableRowHighlightFillClasses)
    assertListRowRecipe(selectableRowListPointerHoverClasses)
  })

  it('encodes list row chrome with list highlight', () => {
    assertListRowRecipe(
      interactiveListRowChromeVariants({
        highlighted: true,
        selected: false,
        interactive: true,
      }),
    )
  })
})

describe('selectable row interaction recipe (hosts)', () => {
  it('InteractiveListRow uses list row hover for pointer hover', () => {
    const { container } = render(<InteractiveListRow name="Fireball" />)
    assertListRowRecipe(container.firstElementChild?.className ?? '')
  })

  it('InteractiveListRow uses list highlight when highlighted (combobox/search listbox path)', () => {
    const { container } = render(<InteractiveListRow name="Fireball" highlighted />)
    assertListRowRecipe(container.firstElementChild?.className ?? '')
    expect(container.firstElementChild).toHaveClass('ui-interactive-row--highlight-list')
  })

  it('InteractiveListRow uses strong list highlight when selected and highlighted', () => {
    const { container } = render(<InteractiveListRow name="Fireball" highlighted selected />)
    expect(container.firstElementChild).toHaveClass('ui-interactive-row--highlight-list-selected')
    expect(container.firstElementChild).toHaveClass('ui-interactive-row--fill-surface')
  })

  it('InteractiveListRow uses selected fill when selected, not pointer hover', () => {
    const { container } = render(<InteractiveListRow name="Fireball" selected />)
    const shell = container.firstElementChild
    expect(shell).toHaveClass('ui-interactive-row--fill-surface')
    expect(shell).not.toHaveClass('ui-interactive-row--hover')
  })

  it('ComboboxOptionRow shell uses list highlight when highlighted', () => {
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
    assertListRowRecipe(shell?.className ?? '')
  })

  it('MenuChoiceRow uses ui-menu-item chrome only', () => {
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
    expect(item).toHaveClass('ui-menu-item')
    expect(item.className).not.toContain('ui-interactive-row')
    expect(item.className).not.toContain('ui-interactive-list__main')
    expect(screen.getByText('Details')).toHaveClass('ui-menu-item__description')
  })

  it('search-style link row composes InteractiveListRow hover recipe', () => {
    const { container } = render(
      <InteractiveListRow name="Fireball" classification="Spell" asChild>
        <a href="/example">Navigate</a>
      </InteractiveListRow>,
    )
    assertListRowRecipe(container.firstElementChild?.className ?? '')
  })
})
