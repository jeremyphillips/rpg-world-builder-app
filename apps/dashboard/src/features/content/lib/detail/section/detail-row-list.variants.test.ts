import { describe, expect, it } from 'vitest'

import { detailRowListSeparatorVariants } from './detail-row-list.variants'

describe('detailRowListSeparatorVariants', () => {
  it('applies structural sibling dividers', () => {
    expect(detailRowListSeparatorVariants({ kind: 'structural' })).toContain('[&>*+*]:border-t')
    expect(detailRowListSeparatorVariants({ kind: 'structural' })).toContain(
      '[&>*+*]:border-border-subtle',
    )
  })

  it('applies record list-item dividers', () => {
    expect(detailRowListSeparatorVariants({ kind: 'record' })).toContain('[&>li+li]:border-t')
    expect(detailRowListSeparatorVariants({ kind: 'record' })).toContain(
      '[&>li+li]:border-border-subtle',
    )
  })
})
