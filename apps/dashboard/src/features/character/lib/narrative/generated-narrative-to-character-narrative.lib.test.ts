import { describe, expect, it } from 'vitest'

import {
  escapeNarrativeHtml,
  generatedNarrativeToCharacterNarrative,
} from './generated-narrative-to-character-narrative.lib'

describe('generatedNarrativeToCharacterNarrative', () => {
  it('escapes interpolated names in generated html', () => {
    expect(escapeNarrativeHtml(`O'Malley & Co.`)).toBe('O&#39;Malley &amp; Co.')
  })

  it('maps generator output to character narrative with paragraph backstory', () => {
    expect(
      generatedNarrativeToCharacterNarrative({
        personalityTraits: ['Brave'],
        ideals: ['Justice'],
        bonds: ['Family'],
        flaws: ['Proud'],
        backstoryParagraphs: ['One', 'Two', 'Three'],
      }),
    ).toEqual({
      personalityTraits: ['Brave'],
      ideals: ['Justice'],
      bonds: ['Family'],
      flaws: ['Proud'],
      backstory: '<p>One</p><p>Two</p><p>Three</p>',
    })
  })
})
