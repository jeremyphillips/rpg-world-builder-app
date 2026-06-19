import { describe, expect, it } from 'vitest'

import { formatFeatureDescriptionHtml } from './format-feature-description-html'

describe('formatFeatureDescriptionHtml', () => {
  it('returns undefined when description is empty', () => {
    expect(formatFeatureDescriptionHtml()).toBeUndefined()
    expect(formatFeatureDescriptionHtml('')).toBeUndefined()
  })

  it('passes through a single paragraph unchanged', () => {
    expect(formatFeatureDescriptionHtml('<p>You gain proficiency with three skills.</p>')).toBe(
      '<p>You gain proficiency with three skills.</p>',
    )
  })

  it('passes through multiple paragraphs unchanged', () => {
    const description =
      '<p>You have learned to cast spells.</p><p><strong>Cantrips.</strong> You know two cantrips.</p>'
    expect(formatFeatureDescriptionHtml(description)).toBe(description)
  })

  it('wraps non-paragraph HTML in a paragraph', () => {
    expect(formatFeatureDescriptionHtml('When you roll Initiative, you regain uses.')).toBe(
      '<p>When you roll Initiative, you regain uses.</p>',
    )
  })
})
