import { describe, expect, it } from 'vitest'

import {
  formatSpellSelectionCounter,
  isSpellChoiceSetFull,
  SPELLS_CHOOSE_CLASS_PROMPT_DESCRIPTION,
  SPELLS_CHOOSE_CLASS_PROMPT_HEADING,
} from './spells-step.lib'

describe('spells-step.lib', () => {
  it('formats selection counters and full state', () => {
    expect(formatSpellSelectionCounter(2, 3)).toBe('Selected: 2 / 3')
    expect(isSpellChoiceSetFull({ max: 2 } as never, ['a', 'b'])).toBe(true)
  })

  it('reuses shared spells choose-class prompt copy', () => {
    expect(SPELLS_CHOOSE_CLASS_PROMPT_HEADING).toBe('Choose a class to see spell options.')
    expect(SPELLS_CHOOSE_CLASS_PROMPT_DESCRIPTION).toBe(
      'Your class determines whether you can cast spells and which spells are available.',
    )
  })
})
