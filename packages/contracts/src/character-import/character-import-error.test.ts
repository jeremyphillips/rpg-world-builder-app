import { describe, expect, it } from 'vitest'

import {
  CHARACTER_IMPORT_CHARACTER_UNAVAILABLE_ALERT,
  getCharacterImportErrorAlert,
} from './character-import-error'

describe('getCharacterImportErrorAlert', () => {
  it('returns dedicated copy for character-unavailable', () => {
    expect(getCharacterImportErrorAlert('character-unavailable')).toEqual(
      CHARACTER_IMPORT_CHARACTER_UNAVAILABLE_ALERT,
    )
  })

  it('returns dedicated copy for unsupported-api-version', () => {
    expect(getCharacterImportErrorAlert('unsupported-api-version')?.title).toBe(
      'D&D Beyond import is temporarily unavailable',
    )
  })
})
