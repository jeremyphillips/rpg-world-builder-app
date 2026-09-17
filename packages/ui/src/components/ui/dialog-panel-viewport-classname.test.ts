import { describe, expect, it } from 'vitest'

import { assertDialogPanelViewportClassName } from './dialog-panel-viewport-classname.lib'

describe('assertDialogPanelViewportClassName', () => {
  it('allows layout and vertical overrides', () => {
    expect(() =>
      assertDialogPanelViewportClassName('section', 'space-y-4 pt-0 focus-visible:ring-2'),
    ).not.toThrow()
  })

  it('rejects horizontal inset on section preset', () => {
    expect(() => assertDialogPanelViewportClassName('section', 'px-6 pt-0')).toThrow(/px-6/)
  })

  it('rejects scroll chrome on section preset', () => {
    expect(() => assertDialogPanelViewportClassName('section', 'ps-1')).toThrow(
      /horizontal inset\/chrome class "ps-1"/,
    )
  })

  it('rejects section inset on inner preset', () => {
    expect(() => assertDialogPanelViewportClassName('inner', 'px-6')).toThrow(/px-6/)
  })

  it('rejects scroll chrome overrides on inner preset', () => {
    expect(() => assertDialogPanelViewportClassName('inner', 'pe-2.5')).toThrow(
      /horizontal inset\/chrome class "pe-2.5"/,
    )
  })
})
