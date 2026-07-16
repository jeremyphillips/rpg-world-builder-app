import { describe, expect, it } from 'vitest'

import { patchTouchesDraftContent } from './character-builder-draft-touch.lib'

describe('patchTouchesDraftContent', () => {
  it('returns false for navigation-only patches', () => {
    expect(patchTouchesDraftContent({ currentStepId: 'species' })).toBe(false)
    expect(
      patchTouchesDraftContent({
        currentStepId: 'species',
        touchedStepIds: ['identity'],
      }),
    ).toBe(false)
  })

  it('returns true when draft content changes', () => {
    expect(
      patchTouchesDraftContent({
        identity: { name: 'Verna' },
      }),
    ).toBe(true)
    expect(
      patchTouchesDraftContent({
        choiceSelections: { 'class-skills': ['athletics'] },
      }),
    ).toBe(true)
  })
})
