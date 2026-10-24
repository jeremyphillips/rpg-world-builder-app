import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { defineMasterDetailItemNoun } from '../../../lib/master-detail/master-detail-item-noun'
import { MasterDetailEditorShell } from '../master-detail-editor-shell'
import { MasterDetailGrid } from '../master-detail-grid'
import {
  masterDetailListScrollRegionClasses,
  masterDetailListScrollViewportClasses,
  masterDetailListShellClasses,
} from '../master-detail-list-panel.layout'

const itemNoun = defineMasterDetailItemNoun({ label: 'Trait', singular: 'trait' })

describe('master-detail layout variants', () => {
  it('aligns grid columns at the start and defines the list max-block-size token', () => {
    const { container } = render(
      <MasterDetailGrid>
        <div>List</div>
      </MasterDetailGrid>,
    )
    const grid = container.firstElementChild
    expect(grid).toHaveClass('items-start')
    expect(grid).toHaveClass('master-detail-grid')
  })

  it('caps the list shell with shared viewport utilities without restating raw lengths', () => {
    expect(masterDetailListShellClasses).toContain('master-detail-list-shell-viewport-cap')
    expect(masterDetailListShellClasses).toContain('sticky')
    expect(masterDetailListShellClasses).toContain(
      'top-[var(--rpg-form-sticky-tabs-block-size,0px)]',
    )
    expect(masterDetailListShellClasses).toContain(
      'min-h-[min(8rem,var(--master-detail-shell-max-block-size))]',
    )
    expect(masterDetailListShellClasses).toContain(
      'md:min-h-[min(12rem,var(--master-detail-shell-max-block-size))]',
    )
    expect(masterDetailListShellClasses).not.toContain('28rem')
    expect(masterDetailListShellClasses).not.toContain('5.5rem')
    expect(masterDetailListShellClasses).not.toContain('70dvh')
    expect(masterDetailListShellClasses).not.toContain('border-border-subtle')
  })

  it('wraps list scroll in a boundary region without reserving scrollbar gutter space', () => {
    expect(masterDetailListScrollRegionClasses).toContain('relative')
    expect(masterDetailListScrollViewportClasses).toContain('overflow-y-auto')
    expect(masterDetailListScrollViewportClasses).toContain('scrollbar-slim')
    expect(masterDetailListScrollViewportClasses).toContain('pe-0')
    expect(masterDetailListScrollViewportClasses).not.toContain(
      'master-detail-list-shell-viewport-cap',
    )
  })

  it('keeps the detail shell content-sized', () => {
    const { container } = render(
      <MasterDetailEditorShell itemNoun={itemNoun} selectedIdentity={{ title: 'Keen senses' }} />,
    )
    const shell = container.firstElementChild
    expect(shell).toHaveClass('self-start', 'ui-panel--quiet', 'ui-panel--bleed')
    expect(shell).not.toHaveClass(
      'border-border-subtle',
      'h-full',
      'overflow-y-auto',
      'bg-field-container',
    )
  })

  it('uses a bleed quiet panel for the list shell', () => {
    expect(masterDetailListShellClasses).toContain('ui-panel--quiet')
    expect(masterDetailListShellClasses).toContain('ui-panel--bleed')
    expect(masterDetailListShellClasses).not.toContain('bg-field-container')
  })
})
