import { describe, expect, it } from 'vitest'

import type { FormEmbeddedMasterDetailMapListItemContext } from '../../../lib/master-detail/use-embedded-master-detail-rows'
import { monsterDefinedFormListMeta } from './monster-defined-form-list-meta'
import type { MonsterDefinedFormDraft } from './monster-forms-form-values'

function listCtx(row: MonsterDefinedFormDraft): FormEmbeddedMasterDetailMapListItemContext {
  return {
    row,
    index: 0,
    field: { id: 'forms-definedForms-0' },
    entityCatalogLayer: undefined,
    getRowIssueCount: () => 0,
  }
}

describe('monsterDefinedFormListMeta size overrides', () => {
  it('omits sizes from the list summary when overrides are empty', () => {
    const form: MonsterDefinedFormDraft = {
      id: 'wolf',
      name: 'Wolf',
      overrides: {},
    }
    expect(monsterDefinedFormListMeta(undefined, listCtx(form))).toEqual({})
  })

  it('shows formatted sizes when overrides.sizes is authored', () => {
    const form: MonsterDefinedFormDraft = {
      id: 'bear',
      name: 'Bear',
      overrides: { sizes: ['large', 'huge'] },
    }
    expect(monsterDefinedFormListMeta(undefined, listCtx(form))).toEqual({
      summary: 'Huge or Large',
    })
  })
})
