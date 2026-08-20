import { describe, expect, it } from 'vitest'

import { buildContentPurposeSelectors } from '@rpg/contracts'
import { makeLocation } from '@/test/fixtures/factories/location'

import { DOCK_WARD, GREYSHORE, HARBORFORD } from '../../fixtures'
import { buildParentLocationFieldOptions } from './location-parent-field-options.lib'

describe('buildParentLocationFieldOptions', () => {
  it('returns only referenceable locations for new parent selection', () => {
    const draftParent = makeLocation({
      id: 'location-draft-parent',
      name: 'Draft Parent',
      status: 'draft',
      kind: 'region',
    })
    const locations = buildContentPurposeSelectors([GREYSHORE, HARBORFORD, draftParent])

    const options = buildParentLocationFieldOptions({
      options: { locations },
    })

    expect(options.map((option) => option.value)).toEqual([GREYSHORE.id, HARBORFORD.id])
  })

  it('preserves a persisted draft parent with an authorized label on edit', () => {
    const draftParent = makeLocation({
      id: 'location-draft-parent',
      name: 'Draft Parent',
      status: 'draft',
      kind: 'region',
    })
    const locations = buildContentPurposeSelectors([GREYSHORE, HARBORFORD, draftParent])

    const options = buildParentLocationFieldOptions({ options: { locations } }, draftParent.id)

    expect(options).toEqual([
      { value: GREYSHORE.id, label: GREYSHORE.name },
      { value: HARBORFORD.id, label: HARBORFORD.name },
      { value: draftParent.id, label: draftParent.name },
    ])
  })

  it('preserves a persisted published parent that is not selectable for hierarchy reasons', () => {
    const locations = buildContentPurposeSelectors([DOCK_WARD, GREYSHORE, HARBORFORD])

    const options = buildParentLocationFieldOptions({ options: { locations } }, DOCK_WARD.id)

    expect(options.some((option) => option.value === DOCK_WARD.id)).toBe(true)
  })
})
