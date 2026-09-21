import { describe, expect, it } from 'vitest'

import {
  formatProficienciesChooseClassPromptDescription,
  formatProficienciesChooseClassPromptHeading,
} from './format-proficiencies-choose-class-prompt'

describe('formatProficienciesChooseClassPromptCopy', () => {
  it('builds the choose-class prompt heading from vocabulary terms', () => {
    expect(formatProficienciesChooseClassPromptHeading()).toBe(
      'Choose a class to unlock class proficiencies.',
    )
  })

  it('builds the choose-class prompt description from vocabulary terms', () => {
    expect(formatProficienciesChooseClassPromptDescription()).toBe(
      'Your class determines saving throws, skill choices, armor, weapon, and tool proficiencies.',
    )
  })
})
