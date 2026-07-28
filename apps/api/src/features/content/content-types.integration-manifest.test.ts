import { describe, expect, it } from 'vitest'
import { API_CONTENT_TYPE_KEYS } from '@rpg/contracts'
import { CONTENT_TYPE_INTEGRATION_MANIFEST, integrationManifestEntries } from '@rpg/content-types'

import { isContentWriteType } from './content-types'

describe('content-types integration manifest (API layer)', () => {
  it('registers every manifest content type in the API registry', () => {
    for (const [key] of integrationManifestEntries()) {
      expect(isContentWriteType(key), `API registry missing ${key}`).toBe(true)
    }
  })

  it('does not register content types absent from the integration manifest', () => {
    for (const key of API_CONTENT_TYPE_KEYS) {
      expect(
        key in CONTENT_TYPE_INTEGRATION_MANIFEST,
        `manifest missing API-registered type ${key}`,
      ).toBe(true)
    }
  })
})
