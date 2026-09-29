import { describe, expect, it } from 'vitest'

import {
  assertOrganizationMembershipTitleIdUnused,
  countOrganizationMembershipTitleIdUsage,
  materializeOrganizationMembershipCatalogForRequiredTitleIds,
  migrateOrganizationMembershipEdgesToTitleIds,
  resolveOrganizationMembershipMetadata,
  resolveOrganizationMembershipPriority,
  resolveOrganizationMembershipTitleProjection,
  sortOrganizationMembers,
} from './organization-membership'

const bankCatalog = [
  {
    id: 'omt_1',
    sourceTitleId: 'treasurer' as const,
    label: 'Treasurer',
    priority: 50 as const,
  },
  {
    id: 'omt_2',
    sourceTitleId: 'clerk' as const,
    label: 'Clerk',
    priority: 20 as const,
  },
]

describe('resolveOrganizationMembershipPriority', () => {
  it('uses catalog priority from membershipTitleId', () => {
    expect(
      resolveOrganizationMembershipPriority({
        membership: { membershipTitleId: 'omt_2' },
        titles: bankCatalog,
      }),
    ).toBe(20)
  })

  it('returns undefined for broken ids', () => {
    expect(
      resolveOrganizationMembershipPriority({
        membership: { membershipTitleId: 'omt_missing' },
        titles: bankCatalog,
      }),
    ).toBeUndefined()
  })
})

describe('resolveOrganizationMembershipMetadata', () => {
  it('returns catalog id for a known title id selection', () => {
    expect(
      resolveOrganizationMembershipMetadata({
        titles: bankCatalog,
        selectedMembershipTitleId: 'omt_1',
      }),
    ).toEqual({ membershipTitleId: 'omt_1' })
  })

  it('requires a membership title id', () => {
    expect(() =>
      resolveOrganizationMembershipMetadata({
        titles: bankCatalog,
        selectedMembershipTitleId: '',
      }),
    ).toThrow(/required/)
  })

  it('rejects ids outside the organization catalog', () => {
    expect(() =>
      resolveOrganizationMembershipMetadata({
        titles: bankCatalog,
        selectedMembershipTitleId: 'omt_outside',
      }),
    ).toThrow(/not in this organization's catalog/)
  })
})

describe('resolveOrganizationMembershipTitleProjection', () => {
  it('reflects catalog label changes without edge writes', () => {
    const renamedCatalog = bankCatalog.map((row) =>
      row.id === 'omt_1' ? { ...row, label: 'Chief Treasurer' } : row,
    )
    expect(
      resolveOrganizationMembershipTitleProjection({
        catalog: renamedCatalog,
        membershipTitleId: 'omt_1',
      }),
    ).toMatchObject({ status: 'resolved', label: 'Chief Treasurer', priority: 50 })
  })

  it('reflects catalog priority changes for roster ordering', () => {
    const reorderedCatalog = bankCatalog.map((row) =>
      row.id === 'omt_2' ? { ...row, priority: 50 as const } : row,
    )
    expect(
      sortOrganizationMembers([
        { id: 'a', name: 'Alpha', priority: 20 },
        { id: 'b', name: 'Beta', priority: 50 },
      ]),
    ).toEqual([
      { id: 'b', name: 'Beta', priority: 50 },
      { id: 'a', name: 'Alpha', priority: 20 },
    ])
    expect(
      resolveOrganizationMembershipPriority({
        membership: { membershipTitleId: 'omt_2' },
        titles: reorderedCatalog,
      }),
    ).toBe(50)
  })

  it('reports broken references without label fallback', () => {
    expect(
      resolveOrganizationMembershipTitleProjection({
        catalog: bankCatalog,
        membershipTitleId: 'omt_missing',
      }),
    ).toEqual({ status: 'broken', membershipTitleId: 'omt_missing' })
  })
})

describe('membership title id usage guards', () => {
  const edges = [
    { details: { membershipTitleId: 'omt_1' } },
    { details: { membershipTitleId: 'omt_1' } },
    { details: { membershipTitleId: 'omt_2' } },
  ]

  it('counts edge usage for delete guards', () => {
    expect(countOrganizationMembershipTitleIdUsage({ membershipTitleId: 'omt_1', edges })).toBe(2)
    expect(countOrganizationMembershipTitleIdUsage({ membershipTitleId: 'omt_2', edges })).toBe(1)
  })

  it('rejects delete when an id is referenced', () => {
    expect(() =>
      assertOrganizationMembershipTitleIdUnused({ membershipTitleId: 'omt_1', edges }),
    ).toThrow(/referenced by 2/)
    expect(() =>
      assertOrganizationMembershipTitleIdUnused({ membershipTitleId: 'omt_unused', edges }),
    ).not.toThrow()
  })
})

describe('migrateOrganizationMembershipEdgesToTitleIds', () => {
  it('maps matched labels to existing ids and ignores stored priority', () => {
    const { edges } = migrateOrganizationMembershipEdgesToTitleIds({
      catalog: bankCatalog,
      edges: [{ details: { title: 'treasurer', priority: 15, lifecycle: 'current' } }],
    })
    expect(edges[0]).toEqual({ lifecycle: 'current', membershipTitleId: 'omt_1' })
  })

  it('creates one catalog row at a shared valid rank for unmatched labels', () => {
    const { catalog, edges } = migrateOrganizationMembershipEdgesToTitleIds({
      catalog: bankCatalog,
      edges: [
        { details: { title: 'Sea Lord', priority: 40, lifecycle: 'current' } },
        { details: { title: 'Sea Lord', priority: 40, lifecycle: 'former' } },
      ],
      createId: () => 'omt_new',
    })
    expect(catalog).toHaveLength(3)
    expect(catalog[2]).toMatchObject({ id: 'omt_new', label: 'Sea Lord', priority: 40 })
    expect(edges.every((edge) => edge.membershipTitleId === 'omt_new')).toBe(true)
  })

  it('defaults conflicting unmatched priorities to rank 10', () => {
    const { catalog } = migrateOrganizationMembershipEdgesToTitleIds({
      catalog: [],
      edges: [
        { details: { title: 'Freelancer', priority: 40 } },
        { details: { title: 'Freelancer', priority: 20 } },
      ],
      createId: () => 'omt_freelancer',
    })
    expect(catalog[0]).toMatchObject({ priority: 10 })
  })

  it('leaves blank legacy titles without ids until the required-title migration', () => {
    const { catalog, edges } = migrateOrganizationMembershipEdgesToTitleIds({
      catalog: bankCatalog,
      edges: [{ details: { title: '   ', lifecycle: 'current' } }],
    })
    expect(catalog).toHaveLength(2)
    expect(edges[0]).toEqual({ lifecycle: 'current' })
  })
})

describe('materializeOrganizationMembershipCatalogForRequiredTitleIds', () => {
  it('inserts Member for an empty catalog and points untitled edges at it', () => {
    const { catalog, edges } = materializeOrganizationMembershipCatalogForRequiredTitleIds({
      catalog: [],
      edges: [{ details: { lifecycle: 'current' } }],
      createId: () => 'member',
    })
    expect(catalog).toHaveLength(1)
    expect(catalog[0]).toMatchObject({ id: 'omt_member', label: 'Member', priority: 10 })
    expect(edges[0]?.membershipTitleId).toBe('omt_member')
  })

  it('reuses an existing Member label for untitled edges', () => {
    const catalog = [
      { id: 'omt_guildmaster', label: 'Guildmaster', priority: 50 as const },
      { id: 'omt_member', label: 'Member', priority: 10 as const },
    ]
    const { catalog: nextCatalog, edges } =
      materializeOrganizationMembershipCatalogForRequiredTitleIds({
        catalog,
        edges: [{ details: { lifecycle: 'current' } }],
      })
    expect(nextCatalog).toHaveLength(2)
    expect(edges[0]?.membershipTitleId).toBe('omt_member')
  })
})
