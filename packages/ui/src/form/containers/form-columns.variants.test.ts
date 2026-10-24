import { describe, expect, it } from 'vitest'

import { VIEWPORT_MD_MIN_QUERY } from '../../hooks/use-media-min-width.client'
import {
  FORM_COLUMNS_WIDE_MEDIA_QUERY,
  FORM_COLUMNS_WIDTH_EQUAL,
  FORM_COLUMNS_WIDTH_PRIMARY_DETAIL,
  formColumnsGridVariants,
} from './form-columns.variants'

describe('formColumnsGridVariants', () => {
  it('aliases the compiled viewport md query', () => {
    expect(FORM_COLUMNS_WIDE_MEDIA_QUERY).toBe(VIEWPORT_MD_MIN_QUERY)
  })

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
