import { describe, expect, it } from 'vitest'

import { CATALOG_SORT_AXES, CATALOG_SORT_PRESETS } from './index'
import {
  CATALOG_PICKER_SORT_LABEL_BEST_MATCH,
  CATALOG_PICKER_SORT_LABEL_NAME_ASC,
  CATALOG_PICKER_SORT_TRIGGER_LABEL_NAME_ASC,
} from './catalog-sort-picker-labels'

describe('catalog-sort-picker-labels', () => {
  it('derives legacy flat-menu labels from the presentation registry', () => {
    expect(CATALOG_PICKER_SORT_LABEL_BEST_MATCH).toBe(CATALOG_SORT_PRESETS.best_match.label)
    expect(CATALOG_PICKER_SORT_LABEL_NAME_ASC).toBe(CATALOG_SORT_AXES.name.ascending.triggerLabel)
    expect(CATALOG_PICKER_SORT_TRIGGER_LABEL_NAME_ASC).toBe(CATALOG_SORT_AXES.name.ascending.label)
  })
})
