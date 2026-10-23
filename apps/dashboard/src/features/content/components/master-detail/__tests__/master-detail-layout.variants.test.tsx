import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { defineMasterDetailItemNoun } from '../../../lib/master-detail/master-detail-item-noun'
import { MasterDetailEditorShell } from '../master-detail-editor-shell'
import { MasterDetailGrid } from '../master-detail-grid'
import { masterDetailListLayoutClasses } from '../master-detail-list-panel'

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
    expect(grid?.className).toContain('[--master-detail-list-max-block-size:28rem]')
  })

  it('caps the list shell with shared viewport utilities without restating raw lengths', () => {
    const { shell } = masterDetailListLayoutClasses
    expect(shell).toContain('master-detail-list-shell-viewport-cap')
    expect(shell).toContain('sticky')
    expect(shell).toContain('top-[var(--rpg-form-sticky-tabs-block-size,0px)]')
    expect(shell).toContain('min-h-[min(8rem,var(--master-detail-shell-max-block-size))]')
    expect(shell).toContain('md:min-h-[min(12rem,var(--master-detail-shell-max-block-size))]')
    expect(shell).not.toContain('28rem')
    expect(shell).not.toContain('70dvh')
    expect(shell).not.toContain('border-border-subtle')
  })

  it('wraps list scroll in a boundary region without reserving scrollbar gutter space', () => {
    const { scrollRegion, scrollViewport } = masterDetailListLayoutClasses
    expect(scrollRegion).toContain('relative')
    expect(scrollViewport).toContain('overflow-y-auto')
    expect(scrollViewport).toContain('scrollbar-slim')
    expect(scrollViewport).toContain('pe-0')
    expect(scrollViewport).not.toContain('master-detail-list-shell-viewport-cap')
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
    const { shell } = masterDetailListLayoutClasses
    expect(shell).toContain('ui-panel--quiet')
    expect(shell).toContain('ui-panel--bleed')
    expect(shell).not.toContain('bg-field-container')
  })
})
