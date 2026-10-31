import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import type { ContentTypeKey } from '../../primitives/content/content-type-keys'
import { entryProvenanceSchema } from '../../primitives/provenance'
import { classBodyDraftSchema, classBodySchema, subclassBodySchema } from '../classes/class'
import { equipmentBodyDraftSchema, equipmentBodySchema } from '../equipment'
import { featBodyDraftSchema, featBodySchema } from '../feat'
import { locationBodyDraftSchema, locationBodySchema } from '../location/location'
import { monsterBodyDraftSchema, monsterBodySchema } from '../monster'
import { organizationBodyDraftSchema, organizationBodySchema } from '../organization/organization'
import { skillProficiencyBodyDraftSchema, skillProficiencyBodySchema } from '../skill-proficiency'
import { speciesBodyDraftSchema, speciesBodySchema } from '../species'
import { spellBodyDraftSchema, spellBodySchema } from '../spell/body'
import { CONTENT_TYPE_CAPABILITIES } from './content-type-capabilities'
import { collectProvenanceEntryPaths, provenanceHostsMatchSchema } from './provenance-schema-parity'

const bodySchemas = {
  classes: [classBodySchema, classBodyDraftSchema],
  spells: [spellBodySchema, spellBodyDraftSchema],
  species: [speciesBodySchema, speciesBodyDraftSchema],
  feats: [featBodySchema, featBodyDraftSchema],
  equipment: [equipmentBodySchema, equipmentBodyDraftSchema],
  'skill-proficiencies': [skillProficiencyBodySchema, skillProficiencyBodyDraftSchema],
  organizations: [organizationBodySchema, organizationBodyDraftSchema],
  locations: [locationBodySchema, locationBodyDraftSchema],
  monsters: [monsterBodySchema, monsterBodyDraftSchema],
} as const satisfies Record<ContentTypeKey, readonly [z.ZodType, z.ZodType]>

describe('provenance host schema parity', () => {
  it('matches every published and draft body to the host registry', () => {
    for (const contentType of Object.keys(bodySchemas) as ContentTypeKey[]) {
      const hosts = CONTENT_TYPE_CAPABILITIES[contentType].provenanceEntryHosts
      for (const schema of bodySchemas[contentType]) {
        expect(provenanceHostsMatchSchema(schema, hosts)).toBe(true)
      }
    }
    expect(provenanceHostsMatchSchema(subclassBodySchema, [])).toBe(true)
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

  it('fails when provenance is not the optional entry schema', () => {
    const required = z.object({
      traits: z.array(
        z.object({
          id: z.string(),
          provenance: entryProvenanceSchema,
        }),
      ),
    })
    const other = z.object({
      traits: z.array(
        z.object({
          id: z.string(),
          provenance: z.object({ note: z.string() }).optional(),
        }),
      ),
    })
    expect(provenanceHostsMatchSchema(required, ['traits'])).toBe(false)
    expect(provenanceHostsMatchSchema(other, ['traits'])).toBe(false)
  })
})
