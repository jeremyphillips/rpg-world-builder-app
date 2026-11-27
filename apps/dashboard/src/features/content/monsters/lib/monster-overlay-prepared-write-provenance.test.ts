import { describe, expect, it } from 'vitest'

import { buildIdentityPreparedWrite } from '../../lib/forms/submit/content-prepared-write.types'
import { mapWireIssuesToAuthoring } from '../../lib/forms/submit/map-wire-issues-to-authoring.lib'

/**
 * System overlay updates serialize an intent envelope, not a full monster input shape.
 * Provenance stays identity until overlay intent field paths map to form owners (see
 * monster-form-def `serializePreparedWrite` system branch).
 */
describe('monster system overlay prepared write provenance', () => {
  it('documents identity provenance and direct wire path attribution for overlay envelope', () => {
    const prepared = buildIdentityPreparedWrite({
      systemOverlayIntent: { set: { name: 'Custom Owlbear' } },
    })

    expect(prepared.provenance).toEqual({})

    const attributed = mapWireIssuesToAuthoring(
      [{ path: 'name', message: 'Too long', severity: 'field' }],
      prepared.provenance,
    )
    expect(attributed.issues[0]?.path).toBe('name')
    expect(attributed.unattributed).toEqual([])
  })
})
