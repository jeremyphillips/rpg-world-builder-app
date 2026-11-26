import { describe, expect, it, vi } from 'vitest'

import type { CatalogOverlayListFailure } from '@rpg/contracts'

import {
  filterSubclassOverlayFailuresForClass,
  resolveSubclassOverlayFailureClassId,
} from './subclass-overlay-failures.lib'

vi.mock('../../../lib/forms/registry/resolve-catalog-seed-body.lib', () => ({
  resolveSubclassCatalogSeedBody: vi.fn((_ruleset: string, id: string) => {
    if (id === 'srd:champion') return { classId: 'srd:fighter' }
    if (id === 'srd:evoker') return { classId: 'srd:wizard' }
    return undefined
  }),
}))

const failure = (id: string): CatalogOverlayListFailure => ({
  targetId: id,
  slug: id,
  name: id,
  code: 'unsupported_overlay_version',
  message: 'bad',
})

describe('subclass overlay failure scoping', () => {
  it('filters failures to the route parent class when ruleset seed is known', () => {
    const scoped = filterSubclassOverlayFailuresForClass(
      [failure('srd:champion'), failure('srd:evoker')],
      'srd:fighter',
      'srd-cc-5.2.1',
    )
    expect(scoped.map((row) => row.targetId)).toEqual(['srd:champion'])
  })

  it('drops failures with unknown seed rows instead of trusting the route class', () => {
    const scoped = filterSubclassOverlayFailuresForClass(
      [failure('srd:unknown')],
      'srd:fighter',
      'srd-cc-5.2.1',
    )
    expect(scoped).toEqual([])
  })

  it('uses seed classId for list items instead of the route when authoritative', () => {
    expect(
      resolveSubclassOverlayFailureClassId(failure('srd:evoker'), 'srd:fighter', 'srd-cc-5.2.1'),
    ).toBe('srd:wizard')
  })
})
