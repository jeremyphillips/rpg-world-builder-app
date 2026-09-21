import { describe, expect, it } from 'vitest'

import {
  formatSpellsChooseClassPromptDescription,
  formatSpellsChooseClassPromptHeading,
} from './format-spells-choose-class-prompt'

describe('formatSpellsChooseClassPromptCopy', () => {
  it('formats the blocked-class heading from vocabulary terms', () => {
    expect(formatSpellsChooseClassPromptHeading()).toBe('Choose a class to see spell options.')
  })

  it('formats the blocked-class description from vocabulary terms', () => {
    expect(formatSpellsChooseClassPromptDescription()).toBe(
      'Your class determines whether you can cast spells and which spells are available.',
    )
  })
})
