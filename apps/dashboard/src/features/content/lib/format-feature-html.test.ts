import { describe, expect, it } from 'vitest'

import { formatFeatureHtml } from './format-feature-html'

describe('formatFeatureHtml', () => {
  it('returns a heading-only paragraph when description is empty', () => {
    expect(formatFeatureHtml(3, 'Bonus Proficiencies')).toBe(
      '<p><strong>Level 3: Bonus Proficiencies</strong></p>',
    )
  })

  it('merges heading into a single body paragraph', () => {
    expect(
      formatFeatureHtml(3, 'Bonus Proficiencies', '<p>You gain proficiency with three skills.</p>'),
    ).toBe(
      '<p><strong>Level 3: Bonus Proficiencies</strong> You gain proficiency with three skills.</p>',
    )
  })

  it('keeps multiple body paragraphs after a separate heading paragraph', () => {
    const description =
      '<p>You have learned to cast spells.</p><p><strong>Cantrips.</strong> You know two cantrips.</p>'
    expect(formatFeatureHtml(1, 'Spellcasting', description)).toBe(
      '<p><strong>Level 1: Spellcasting</strong></p><p>You have learned to cast spells.</p><p><strong>Cantrips.</strong> You know two cantrips.</p>',
    )
  })

  it('wraps non-paragraph HTML as inline body text', () => {
    expect(
      formatFeatureHtml(18, 'Superior Inspiration', 'When you roll Initiative, you regain uses.'),
    ).toBe(
      '<p><strong>Level 18: Superior Inspiration</strong> When you roll Initiative, you regain uses.</p>',
    )
  })
})
