import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { entryProvenanceSchema } from '../../primitives/provenance'
import { CONTENT_TYPE_CAPABILITIES } from './content-type-capabilities'
import { monsterBodyDraftSchema, monsterBodySchema } from '../monster'
import { collectProvenanceEntryPaths, provenanceHostsMatchSchema } from './provenance-schema-parity'

describe('provenance host schema parity', () => {
  it('matches monster published and draft bodies to the host registry', () => {
    const hosts = CONTENT_TYPE_CAPABILITIES.monsters.provenanceEntryHosts
    expect(provenanceHostsMatchSchema(monsterBodySchema, hosts)).toBe(true)
    expect(provenanceHostsMatchSchema(monsterBodyDraftSchema, hosts)).toBe(true)
  })

  it('fails when provenance appears on an unregistered entry shape', () => {
    const rogue = z.object({
      notes: z.array(
        z.object({
          id: z.string(),
          provenance: entryProvenanceSchema.optional(),
        }),
      ),
    })
    expect(collectProvenanceEntryPaths(rogue)).toEqual(['notes'])
    expect(provenanceHostsMatchSchema(rogue, [])).toBe(false)
  })
})
