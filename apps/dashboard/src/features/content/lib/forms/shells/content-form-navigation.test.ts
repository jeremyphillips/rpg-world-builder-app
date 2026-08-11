import { describe, expect, it } from 'vitest'

import { contentEditHref } from '../../detail/page/content-edit-href'
import {
  resolveContentPostCreateEditHref,
  routeKeyToContentRouteSection,
} from './content-form-navigation'

describe('routeKeyToContentRouteSection', () => {
  it('maps skill-proficiencies to skillProficiencies', () => {
    expect(routeKeyToContentRouteSection('skill-proficiencies')).toBe('skillProficiencies')
  })

  it('passes through keys that match CONTENT_ROUTES sections', () => {
    expect(routeKeyToContentRouteSection('spells')).toBe('spells')
    expect(routeKeyToContentRouteSection('equipment')).toBe('equipment')
    expect(routeKeyToContentRouteSection('organizations')).toBe('organizations')
  })
})

describe('resolveContentPostCreateEditHref', () => {
  it('resolves spell edit href after create', () => {
    expect(resolveContentPostCreateEditHref({ routeKey: 'spells' }, 'c1', { id: 'sp1' })).toBe(
      contentEditHref('spells', 'c1', 'sp1'),
    )
  })

  it('resolves organization edit href after create', () => {
    expect(
      resolveContentPostCreateEditHref({ routeKey: 'organizations' }, 'c1', { id: 'org1' }),
    ).toBe(contentEditHref('organizations', 'c1', 'org1'))
  })

  it('resolves equipment edit href using form context family', () => {
    expect(
      resolveContentPostCreateEditHref(
        { routeKey: 'equipment' },
        'c1',
        { id: 'eq1', kind: 'weapon' },
        { equipmentFamily: 'weapons' },
      ),
    ).toBe(contentEditHref('equipment', 'c1', 'eq1', 'weapons'))
  })

  it('derives equipment family from saved kind when context omits family', () => {
    expect(
      resolveContentPostCreateEditHref({ routeKey: 'equipment' }, 'c1', {
        id: 'eq1',
        kind: 'armor',
      }),
    ).toBe(contentEditHref('equipment', 'c1', 'eq1', 'armor'))
  })
})
