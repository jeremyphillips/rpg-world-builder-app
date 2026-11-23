import { describe, expect, it } from 'vitest'

import { TRAIT_MASTER_DETAIL_ITEM_NOUN } from '../../../species/lib/species-trait-form-labels'
import { resolveMasterDetailRowTitle } from '../../../lib/master-detail/master-detail-row-title'

import { resolveMonsterTraitRowTitleConfig } from './monster-trait-row-title'

describe('monster trait row title', () => {
  const config = resolveMonsterTraitRowTitleConfig('Lich')

  it('uses bare template labels with configured use notation in the list', () => {
    const resolved = resolveMasterDetailRowTitle(config, {
      row: {
        id: 'lr',
        kind: 'template',
        templateId: 'legendary-resistance',
        config: { uses: { normal: 4, inLair: 5 } },
      },
      rows: [
        {
          id: 'lr',
          kind: 'template',
          templateId: 'legendary-resistance',
          config: { uses: { normal: 4, inLair: 5 } },
        },
      ],
      index: 0,
      fieldId: 'lr',
      lastAddedFieldId: null,
      itemNoun: TRAIT_MASTER_DETAIL_ITEM_NOUN,
      rowReady: true,
    })
    expect(resolved.displayTitle).toBe('Legendary Resistance (4/Day)')
    expect(resolved.inlineTitle).toBeUndefined()
  })
})
