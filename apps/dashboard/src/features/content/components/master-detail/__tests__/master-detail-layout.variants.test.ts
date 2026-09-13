import { describe, expect, it } from 'vitest'

import { masterDetailEditorShellClasses } from '../master-detail-editor-panel.variants'
import { masterDetailGridClasses } from '../master-detail-grid.variants'
import { masterDetailListScrollClasses } from '../master-detail-list-panel.variants'

describe('master-detail layout variants', () => {
  it('aligns grid columns at the start and defines the list max-block-size token', () => {
    expect(masterDetailGridClasses).toContain('items-start')
    expect(masterDetailGridClasses).toContain('[--master-detail-list-max-block-size:28rem]')
  })

  it('consumes the list max-block-size token without restating the raw length', () => {
    expect(masterDetailListScrollClasses).toContain('overflow-y-auto')
    expect(masterDetailListScrollClasses).toContain('var(--master-detail-list-max-block-size)')
    expect(masterDetailListScrollClasses).not.toContain('28rem')
  })

  it('keeps the detail shell content-sized', () => {
    expect(masterDetailEditorShellClasses).toContain('self-start')
    expect(masterDetailEditorShellClasses).not.toContain('h-full')
    expect(masterDetailEditorShellClasses).not.toContain('overflow-y-auto')
  })
})
