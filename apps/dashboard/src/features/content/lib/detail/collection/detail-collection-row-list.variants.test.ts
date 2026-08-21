import { describe, expect, it } from 'vitest'

import { detailCollectionRecordSeparatorVariants } from './detail-collection-chrome.variants'
import { detailCollectionRowListStructuralSeparatorVariants } from './detail-collection-row-list.variants'

describe('detailCollectionRowListStructuralSeparatorVariants', () => {
  it('applies structural sibling dividers', () => {
    expect(detailCollectionRowListStructuralSeparatorVariants()).toContain('[&>*+*]:border-t')
    expect(detailCollectionRowListStructuralSeparatorVariants()).toContain(
      '[&>*+*]:border-border-subtle',
    )
  })
})

describe('detailCollectionRecordSeparatorVariants', () => {
  it('applies record list-item dividers', () => {
    expect(detailCollectionRecordSeparatorVariants()).toContain('[&>li+li]:border-t')
    expect(detailCollectionRecordSeparatorVariants()).toContain('[&>li+li]:border-border-subtle')
  })
})
