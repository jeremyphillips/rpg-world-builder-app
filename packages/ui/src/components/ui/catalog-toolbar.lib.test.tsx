import { describe, expect, it } from 'vitest'

import { resolveCatalogToolbarLayout } from './catalog-toolbar.lib'

describe('resolveCatalogToolbarLayout', () => {
  it('places tabs before search by default', () => {
    expect(
      resolveCatalogToolbarLayout({
        tabs: {
          items: [{ id: 'featured', label: 'Featured' }],
          activeId: 'featured',
          onActiveIdChange: () => undefined,
        },
      }),
    ).toMatchObject({
      hasTabs: true,
      tabsBeforeSearch: true,
      tabsAfterSearch: false,
    })
  })

  it('places tabs after search when configured', () => {
    expect(
      resolveCatalogToolbarLayout({
        tabs: {
          items: [{ id: 'featured', label: 'Featured' }],
          activeId: 'featured',
          onActiveIdChange: () => undefined,
          position: 'after-search',
        },
      }),
    ).toMatchObject({
      tabsBeforeSearch: false,
      tabsAfterSearch: true,
    })
  })

  it('keeps standalone actions when tabs are absent', () => {
    const reset = <button type="button">Reset</button>

    expect(
      resolveCatalogToolbarLayout({
        actions: reset,
      }),
    ).toEqual({
      hasTabs: false,
      tabsBeforeSearch: false,
      tabsAfterSearch: false,
      showFilterRow: false,
      trailingActions: reset,
    })
  })
})
