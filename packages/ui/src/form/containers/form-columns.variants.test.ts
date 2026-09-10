import { describe, expect, it } from 'vitest'

import {
  FORM_COLUMNS_WIDTH_EQUAL,
  FORM_COLUMNS_WIDTH_PRIMARY_DETAIL,
  formColumnsGridVariants,
} from './form-columns.variants'

describe('formColumnsGridVariants', () => {
  it('uses equal two-column tracks by default', () => {
    expect(formColumnsGridVariants({ count: 2, ratio: FORM_COLUMNS_WIDTH_EQUAL })).toContain(
      'md:grid-cols-2',
    )
    expect(formColumnsGridVariants({ count: 2, ratio: FORM_COLUMNS_WIDTH_EQUAL })).not.toContain(
      '2fr',
    )
  })

  it('applies the primary-detail ratio for two columns', () => {
    expect(
      formColumnsGridVariants({ count: 2, ratio: FORM_COLUMNS_WIDTH_PRIMARY_DETAIL }),
    ).toContain('md:grid-cols-[2fr_minmax(18rem,1fr)]')
  })
})
