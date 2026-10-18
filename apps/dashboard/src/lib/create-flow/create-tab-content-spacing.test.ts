import { catalogPickerCardListClasses } from '@rpg/ui'
import { describe, expect, it } from 'vitest'

import {
  createTabDiscoveryListClasses,
  createTabPendingListClasses,
} from './create-tab-content.variants'

describe('create tab picker list spacing SSOT', () => {
  it('matches catalog picker sheet card list rhythm', () => {
    expect(createTabDiscoveryListClasses).toBe(catalogPickerCardListClasses)
    expect(createTabPendingListClasses).toBe(catalogPickerCardListClasses)
  })
})
