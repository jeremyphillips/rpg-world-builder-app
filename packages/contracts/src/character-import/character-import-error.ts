import { DND_BEYOND_PAYLOAD_VERSION } from './dnd-beyond/dnd-beyond-version'

// ---------------------------------------------------------------------------
// Character import API error codes — stable client-facing identifiers.
// ---------------------------------------------------------------------------

export const CHARACTER_IMPORT_ERROR_CODES = [
  'unsupported-api-version',
  'character-unavailable',
  'upstream-failure',
  'invalid-upstream-payload',
] as const

export type CharacterImportErrorCode = (typeof CHARACTER_IMPORT_ERROR_CODES)[number]

/** API-safe messages — never forward raw D&D Beyond provider text. */
export const CHARACTER_IMPORT_ERROR_MESSAGES: Record<CharacterImportErrorCode, string> = {
  'unsupported-api-version':
    'D&D Beyond import is temporarily unavailable because the importer API version is no longer supported.',
  'character-unavailable':
    'D&D Beyond did not return character data for this request. The character may be private, deleted, or inaccessible.',
  'upstream-failure': 'Could not reach D&D Beyond. Try again in a moment.',
  'invalid-upstream-payload':
    'D&D Beyond returned an unexpected character payload. The importer may need to be updated.',
}

export const CHARACTER_IMPORT_UNSUPPORTED_API_VERSION_ALERT = {
  title: 'D&D Beyond import is temporarily unavailable',
  description:
    'This importer uses a D&D Beyond API version that is no longer supported. The importer must be updated before this character can be previewed.',
} as const

export const CHARACTER_IMPORT_CHARACTER_UNAVAILABLE_ALERT = {
  title: 'This character may be private',
  description:
    'D&D Beyond did not return character data without an authenticated session. Make the character public or upload a JSON export created while signed in.',
} as const

export type CharacterImportVersionMetadata = {
  requestedPayloadVersion: typeof DND_BEYOND_PAYLOAD_VERSION
  supportedPayloadVersion: typeof DND_BEYOND_PAYLOAD_VERSION
}

export function isCharacterImportErrorCode(code: string): code is CharacterImportErrorCode {
  return (CHARACTER_IMPORT_ERROR_CODES as readonly string[]).includes(code)
}

export function getCharacterImportErrorAlert(errorCode: string | undefined): {
  title: string
  description: string
} | null {
  if (errorCode === 'unsupported-api-version') {
    return CHARACTER_IMPORT_UNSUPPORTED_API_VERSION_ALERT
  }
  if (errorCode === 'character-unavailable') {
    return CHARACTER_IMPORT_CHARACTER_UNAVAILABLE_ALERT
  }
  if (errorCode && isCharacterImportErrorCode(errorCode)) {
    return {
      title: 'Import preview failed',
      description: CHARACTER_IMPORT_ERROR_MESSAGES[errorCode],
    }
  }
  return null
}
