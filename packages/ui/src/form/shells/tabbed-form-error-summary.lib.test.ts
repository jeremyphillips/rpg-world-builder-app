import { describe, expect, it } from 'vitest'

import {
  buildTabbedFormErrorSummaryMessage,
  buildTabbedFormReviewLabel,
  formatTabLabelList,
} from './tabbed-form-error-summary.lib'

describe('formatTabLabelList', () => {
  it('joins one, two, and three or more labels', () => {
    expect(formatTabLabelList(['Rules'])).toBe('Rules')
    expect(formatTabLabelList(['Rules', 'Flavor'])).toBe('Rules and Flavor')
    expect(formatTabLabelList(['Identity', 'Rules', 'Flavor'])).toBe('Identity, Rules, and Flavor')
  })
})

describe('buildTabbedFormErrorSummaryMessage', () => {
  it('builds the summary sentence from tab labels', () => {
    expect(buildTabbedFormErrorSummaryMessage(['Rules', 'Flavor'])).toBe(
      'Some fields need attention. Errors were found in Rules and Flavor.',
    )
  })
})

describe('buildTabbedFormReviewLabel', () => {
  it('prefixes the tab label with Review', () => {
    expect(buildTabbedFormReviewLabel('Rules')).toBe('Review Rules')
  })
})
