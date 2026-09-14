import { describe, expect, it } from 'vitest'

import { masterDetailEditorShellClasses } from '../master-detail-editor-panel.variants'
import { masterDetailGridClasses } from '../master-detail-grid.variants'
import {
  masterDetailListScrollRegionClasses,
  masterDetailListScrollViewportClasses,
  masterDetailListShellClasses,
} from '../master-detail-list-panel.variants'

describe('master-detail layout variants', () => {
  it('aligns grid columns at the start and defines the list max-block-size token', () => {
    expect(masterDetailGridClasses).toContain('items-start')
    expect(masterDetailGridClasses).toContain('[--master-detail-list-max-block-size:28rem]')
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
    expect(masterDetailListShellClasses).not.toContain('70dvh')
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
    expect(masterDetailEditorShellClasses).toContain('self-start')
    expect(masterDetailEditorShellClasses).not.toContain('h-full')
    expect(masterDetailEditorShellClasses).not.toContain('overflow-y-auto')
  })
})
