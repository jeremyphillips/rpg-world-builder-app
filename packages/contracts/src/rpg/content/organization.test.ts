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
  it('requires organizationKind for publish-complete bodies', () => {
    expect(
      organizationBodySchema.parse({
        name: 'The Lantern Guild',
        organizationKind: 'professional',
      }),
    ).toEqual({
      name: 'The Lantern Guild',
      organizationKind: 'professional',
    })

    expect(organizationBodySchema.safeParse({ name: 'The Lantern Guild' }).success).toBe(false)
  })

  it('allows drafts without organizationKind and normalizes blank names', () => {
    expect(organizationBodyDraftSchema.parse({ name: '  ' })).toEqual({
      name: 'Untitled Organization',
    })
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
        organizationKind: 'professional',
      }).organizationKind,
    ).toBe('professional')

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
})

describe('organization authoring inputs', () => {
  it('requires a kind for publish create but not draft create', () => {
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
        organizationKind: 'professional',
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
    expect(updateOrganizationInputSchema.parse({ organizationKind: 'academic' })).toEqual({
      organizationKind: 'academic',
    })
    expect(updateOrganizationDraftInputSchema.parse({ description: '<p>Notes</p>' })).toEqual({
      description: '<p>Notes</p>',
    })
  })
})
