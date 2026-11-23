import { describe, expect, it } from 'vitest'

import { resolveMasterDetailRowTitle } from '../../lib/master-detail/master-detail-row-title'
import { CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN } from './class-feature-form-labels'
import { createClassFeatureRowTitleConfig } from './class-feature-row-title'

describe('createClassFeatureRowTitleConfig', () => {
  const config = createClassFeatureRowTitleConfig('Fighter')

  it('uses authored titles for custom features', () => {
    const resolution = resolveMasterDetailRowTitle(config, {
      row: { kind: 'custom', name: 'Second Wind' },
      index: 0,
      fieldId: 'f0',
      rows: [],
      itemNoun: CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN,
      lastAddedFieldId: null,
      rowReady: true,
    })
    expect(resolution.inlineTitle).toMatchObject({ mode: 'authored', field: 'name' })
    expect(resolution.displayTitle).toBe('Second Wind')
  })

  it('uses override titles for subclass-choice rows', () => {
    const resolution = resolveMasterDetailRowTitle(config, {
      row: { kind: 'subclass-choice', name: '' },
      index: 0,
      fieldId: 'f0',
      rows: [],
      itemNoun: CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN,
      lastAddedFieldId: null,
      rowReady: true,
    })
    expect(resolution.inlineTitle).toMatchObject({ mode: 'override', field: 'name' })
    expect(resolution.displayTitle).toContain('Subclass')
  })
})
