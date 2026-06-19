import { describe, expect, it } from 'vitest'

import { formatFeatureHtml } from './format-feature-html'

describe('formatFeatureHtml', () => {
  it('renders heading-only HTML when description is empty', () => {
    expect(formatFeatureHtml(19, 'Epic Boon')).toBe('<p><strong>Level 19: Epic Boon</strong></p>')
    expect(formatFeatureHtml(19, 'Epic Boon', '')).toBe(
      '<p><strong>Level 19: Epic Boon</strong></p>',
    )
  })

  it('merges a single paragraph with the heading', () => {
    expect(
      formatFeatureHtml(
        3,
        'Bonus Proficiencies',
        '<p>You gain proficiency with three skills of your choice.</p>',
      ),
    ).toBe(
      '<p><strong>Level 3: Bonus Proficiencies</strong> You gain proficiency with three skills of your choice.</p>',
    )
  })

  it('keeps multiple paragraphs unchanged after a separate heading paragraph', () => {
    const description =
      '<p>You have learned to cast spells through your bardic arts.</p><p><strong>Cantrips.</strong> You know two cantrips.</p>'

    expect(formatFeatureHtml(1, 'Spellcasting', description)).toBe(
      '<p><strong>Level 1: Spellcasting</strong></p><p>You have learned to cast spells through your bardic arts.</p><p><strong>Cantrips.</strong> You know two cantrips.</p>',
    )
  })

  it('merges plain-text descriptions without paragraph tags', () => {
    expect(
      formatFeatureHtml(5, 'Font of Inspiration', 'When you roll Initiative, you regain uses.'),
    ).toBe(
      '<p><strong>Level 5: Font of Inspiration</strong> When you roll Initiative, you regain uses.</p>',
    )
  })
})
