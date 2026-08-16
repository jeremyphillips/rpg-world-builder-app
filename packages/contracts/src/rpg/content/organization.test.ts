import { describe, expect, it } from 'vitest'

import {
  createOrganizationDraftInputSchema,
  createOrganizationInputSchema,
  organizationBodyDraftSchema,
  organizationBodySchema,
  organizationDraftStoredSchema,
  organizationReferenceResolutionSchema,
  organizationSchema,
  updateOrganizationDraftInputSchema,
  updateOrganizationInputSchema,
} from './organization'

const timestamps = {
  createdAt: '2026-07-28T12:00:00.000Z',
  updatedAt: '2026-07-28T12:00:00.000Z',
}

describe('organization body contracts', () => {
  it('requires organizationDomain for publish-complete bodies', () => {
    expect(
      organizationBodySchema.parse({
        name: 'The Lantern Guild',
        organizationDomain: 'occupational',
      }),
    ).toEqual({
      name: 'The Lantern Guild',
      organizationDomain: 'occupational',
      functions: [],
      practices: [],
      connections: { locations: [] },
    })

    expect(organizationBodySchema.safeParse({ name: 'The Lantern Guild' }).success).toBe(false)
  })

  it('allows an optional reusable form independently of domain', () => {
    expect(
      organizationBodySchema.parse({
        name: 'Crown of Lankhmar',
        organizationDomain: 'government',
        organizationForm: 'association',
      }),
    ).toMatchObject({
      organizationDomain: 'government',
      organizationForm: 'association',
    })
  })

  it('allows drafts to carry form while domain remains incomplete', () => {
    expect(
      organizationBodyDraftSchema.safeParse({
        name: 'Draft Association',
        organizationForm: 'association',
      }).success,
    ).toBe(true)
  })

  it('allows drafts without organizationDomain and normalizes blank names', () => {
    expect(organizationBodyDraftSchema.parse({ name: '  ' })).toEqual({
      name: 'Untitled Organization',
      functions: [],
      practices: [],
    })
  })

  it('accepts ordered functions and practices independently and rejects duplicates', () => {
    expect(
      organizationBodySchema.parse({
        name: 'Ember Works',
        organizationDomain: 'commercial',
        functions: ['production'],
        practices: ['blacksmithing', 'brewing'],
      }),
    ).toMatchObject({
      functions: ['production'],
      practices: ['blacksmithing', 'brewing'],
    })

    expect(
      organizationBodySchema.safeParse({
        name: 'Duplicate Works',
        organizationDomain: 'commercial',
        practices: ['brewing', 'brewing'],
      }).success,
    ).toBe(false)

    expect(
      organizationBodySchema.safeParse({
        name: 'Duplicate Functions',
        organizationDomain: 'commercial',
        functions: ['trade', 'trade'],
      }).success,
    ).toBe(false)
  })
})

describe('organization stored contracts', () => {
  const meta = {
    id: 'organization-1',
    slug: 'lantern-guild',
    rulesetId: 'srd-cc-5.2.1',
    source: 'homebrew' as const,
    campaignId: 'campaign-1',
    ...timestamps,
  }

  it('parses published and draft records with their respective completeness rules', () => {
    expect(
      organizationSchema.parse({
        ...meta,
        status: 'published',
        name: 'The Lantern Guild',
        organizationDomain: 'occupational',
      }).organizationDomain,
    ).toBe('occupational')

    expect(
      organizationDraftStoredSchema.parse({
        ...meta,
        status: 'draft',
        name: '',
      }),
    ).toMatchObject({
      name: 'Untitled Organization',
      status: 'draft',
    })
  })
})

describe('organization reference resolution', () => {
  it('preserves a missing saved reference', () => {
    expect(
      organizationReferenceResolutionSchema.parse({
        organizationId: 'organization-missing',
        organization: null,
      }),
    ).toEqual({ organizationId: 'organization-missing', organization: null })
  })

  it('carries an optional membership title', () => {
    expect(
      organizationReferenceResolutionSchema.parse({
        organizationId: 'organization-1',
        title: 'Guildmaster',
        organization: null,
      }),
    ).toEqual({
      organizationId: 'organization-1',
      title: 'Guildmaster',
      organization: null,
    })
  })
})

describe('organization authoring inputs', () => {
  it('requires a domain for publish create but not draft create', () => {
    expect(
      createOrganizationInputSchema.safeParse({
        slug: 'lantern-guild',
        name: 'The Lantern Guild',
      }).success,
    ).toBe(false)

    expect(
      createOrganizationInputSchema.safeParse({
        slug: 'lantern-guild',
        name: 'The Lantern Guild',
        organizationDomain: 'occupational',
      }).success,
    ).toBe(true)

    expect(
      createOrganizationDraftInputSchema.parse({
        slug: 'untitled-organization',
        name: '',
      }).name,
    ).toBe('Untitled Organization')
  })

  it('supports partial publish and draft updates', () => {
    expect(updateOrganizationInputSchema.parse({ organizationDomain: 'academic' })).toEqual({
      organizationDomain: 'academic',
      connections: { locations: [] },
    })
    expect(updateOrganizationDraftInputSchema.parse({ description: '<p>Notes</p>' })).toEqual({
      description: '<p>Notes</p>',
    })
  })

  it('accepts domain and form as independent partial-update fields', () => {
    expect(
      updateOrganizationInputSchema.safeParse({
        organizationDomain: 'military',
        organizationForm: 'association',
      }).success,
    ).toBe(true)
  })
})
