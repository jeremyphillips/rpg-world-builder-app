import { describe, expect, it } from 'vitest'

import { formatFieldMessage } from '../../../../validation/define-message'
import { characterBuilderLevelMessages } from './character-builder-level-messages'

describe('characterBuilderLevelMessages', () => {
  it('defines stable message ids', () => {
    for (const message of Object.values(characterBuilderLevelMessages)) {
      expect(message.id).toMatch(/^validation\.characterBuilder\.level\./)
    }
  })

  it('formats representative copy', () => {
    expect(formatFieldMessage(characterBuilderLevelMessages.fieldLabel())).toBe('Choose level')
    expect(
      formatFieldMessage(characterBuilderLevelMessages.fixedHelper({ startingLevel: 3 })),
    ).toBe('Campaign entry level (3).')
    expect(
      formatFieldMessage(
        characterBuilderLevelMessages.removalSummary({ label: 'Cantrips', count: 2 }),
      ),
    ).toBe('Cantrips: 2 selections removed')
  })
})
