import { describe, expect, it } from 'vitest'

import { makeLocation } from '@/test/fixtures/factories/location'
import { makeOrganization } from '@/test/fixtures/factories/organization'

import { filterReferenceableCatalogRows } from './content-reference-catalog.lib'

describe('filterReferenceableCatalogRows', () => {
  it('keeps published rows and omits drafts', () => {
    const published = makeLocation({
      kind: 'region',
      id: 'location-published',
      status: 'published',
    })
    const draft = makeLocation({ kind: 'region', id: 'location-draft', status: 'draft' })

    expect(filterReferenceableCatalogRows([published, draft])).toEqual([published])
  })

  it('works for organizations and other resolution rows', () => {
    const published = makeOrganization({ id: 'organization-published', status: 'published' })
    const draft = makeOrganization({ id: 'organization-draft', status: 'draft' })

    expect(filterReferenceableCatalogRows([published, draft])).toEqual([published])
  })
})
