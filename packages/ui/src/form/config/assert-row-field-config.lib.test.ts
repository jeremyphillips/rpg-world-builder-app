import { afterEach, describe, expect, it, vi } from 'vitest'

import type { RowConfig } from '../field-config'
import { assertRowFieldConfig } from './assert-row-field-config.lib'

describe('assertRowFieldConfig', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('warns when a row field sets hint.position below-label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const item: RowConfig = {
      kind: 'row',
      fields: [
        {
          type: 'text',
          name: 'alpha',
          label: 'Alpha',
          hint: { text: 'Help', position: 'below-label' },
        },
      ],
    }

    assertRowFieldConfig(item, 'test-row')

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("hint.position: 'below-label'"))
  })

  it('does not warn for default string hints', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const item: RowConfig = {
      kind: 'row',
      fields: [{ type: 'text', name: 'alpha', label: 'Alpha', hint: 'Help' }],
    }

    assertRowFieldConfig(item)

    expect(warn).not.toHaveBeenCalled()
  })

  it('warns for unsupported field types in rows', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const item: RowConfig = {
      kind: 'row',
      fields: [{ type: 'editableGrid', name: 'grid', label: 'Grid', columns: [], rowCount: 1 }],
    }

    assertRowFieldConfig(item)

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("type: 'editableGrid'"))
  })
})
