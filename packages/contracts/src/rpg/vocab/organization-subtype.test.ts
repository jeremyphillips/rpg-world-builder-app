import { describe, expect, it } from 'vitest'

import { ORGANIZATION_KIND_IDS } from './organization-kind'
import {
  ORGANIZATION_SUBTYPE_IDS,
  ORGANIZATION_SUBTYPES_BY_KIND,
  getOrganizationSubtypeEntry,
  getOrganizationSubtypeIds,
  getOrganizationSubtypeLabel,
  isOrganizationSubtypeValidForKind,
  organizationSubtypeSchema,
  refineOrganizationKindSubtypePair,
} from './organization-subtype'
import { z } from 'zod'

describe('organization subtype vocabulary', () => {
  it('covers every organization kind (including empty other)', () => {
    for (const kind of ORGANIZATION_KIND_IDS) {
      expect(ORGANIZATION_SUBTYPES_BY_KIND).toHaveProperty(kind)
    }
    expect(getOrganizationSubtypeIds('other')).toEqual([])
    expect(ORGANIZATION_SUBTYPE_IDS).toHaveLength(45)
  })

  it('keeps subtype ids globally unique across kinds', () => {
    const seen = new Set<string>()
    for (const kind of ORGANIZATION_KIND_IDS) {
      for (const id of getOrganizationSubtypeIds(kind)) {
        expect(seen.has(id), `duplicate subtype id '${id}'`).toBe(false)
        seen.add(id)
      }
    }
    expect(seen.size).toBe(ORGANIZATION_SUBTYPE_IDS.length)
  })

  it('requires label, description, and non-empty ordered memberTitles on every subtype', () => {
    for (const kind of ORGANIZATION_KIND_IDS) {
      for (const id of getOrganizationSubtypeIds(kind)) {
        const entry = getOrganizationSubtypeEntry(kind, id)
        expect(entry?.label).toBeTruthy()
        expect(entry?.description).toBeTruthy()
        expect(entry?.memberTitles.length).toBeGreaterThan(0)
        expect(entry?.memberTitles).toEqual([...entry!.memberTitles])
      }
    }
  })

  it('validates kind-scoped membership and rejects cross-kind pairs', () => {
    expect(isOrganizationSubtypeValidForKind('government', 'monarchy')).toBe(true)
    expect(isOrganizationSubtypeValidForKind('military', 'monarchy')).toBe(false)
    expect(organizationSubtypeSchema.parse('monarchy')).toBe('monarchy')
    expect(organizationSubtypeSchema.safeParse('not_a_subtype').success).toBe(false)
  })

  it('looks up entries and labels only within the given kind', () => {
    expect(getOrganizationSubtypeLabel('government', 'monarchy')).toBe('Monarchy')
    expect(getOrganizationSubtypeEntry('military', 'monarchy')).toBeUndefined()
    expect(getOrganizationSubtypeLabel('military', 'monarchy')).toBe('monarchy')
  })

  it('refines invalid kind/subtype pairs', () => {
    const schema = z
      .object({
        organizationKind: z.string().optional(),
        organizationSubtype: z.string().optional(),
      })
      .superRefine(refineOrganizationKindSubtypePair)

    expect(
      schema.safeParse({ organizationKind: 'government', organizationSubtype: 'monarchy' }).success,
    ).toBe(true)
    expect(
      schema.safeParse({ organizationKind: 'military', organizationSubtype: 'monarchy' }).success,
    ).toBe(false)
    expect(schema.safeParse({ organizationSubtype: 'monarchy' }).success).toBe(false)
    expect(schema.safeParse({ organizationKind: 'government' }).success).toBe(true)
  })
})
