import { describe, expect, it } from 'vitest'

import { buildContentPurposeSelectors } from '@rpg/contracts'

import { DOCK_WARD, GREYSHORE, HARBORFORD, YAWNING_PORTAL } from '../../fixtures'
import { makeContentFormCtx } from '../../../lib/fixtures/content-form-ctx'
import {
  buildParentLocationComboboxOptionsResolve,
  buildParentLocationKindFilterSelect,
  buildValidParentLocationFieldOptions,
} from './location-parent-combobox.lib'

describe('buildValidParentLocationFieldOptions', () => {
  it('includes only parent kinds allowed for the child kind', () => {
    const options = buildValidParentLocationFieldOptions(
      [GREYSHORE, DOCK_WARD, HARBORFORD, YAWNING_PORTAL],
      'structure',
      YAWNING_PORTAL.id,
    )

    expect(options.map((option) => option.value)).toEqual([DOCK_WARD.id, HARBORFORD.id])
    expect(options[0]?.filterCategory).toBe('district')
    expect(options[0]?.classification).toBe('District')
  })
})

describe('buildParentLocationKindFilterSelect', () => {
  it('lists only allowed parent kinds for the child', () => {
    const filter = buildParentLocationKindFilterSelect('region')
    expect(filter.options.map((option) => option.value)).toEqual(['all', 'world', 'region'])
  })
})

describe('buildParentLocationComboboxOptionsResolve', () => {
  it('omits invalid parents from the resolved option list', () => {
    const ctx = makeContentFormCtx({
      entityId: YAWNING_PORTAL.id,
      options: {
        locations: buildContentPurposeSelectors([GREYSHORE, DOCK_WARD, HARBORFORD]),
      },
    })

    const resolve = buildParentLocationComboboxOptionsResolve(ctx)
    const options = resolve.optionsWhen({ authoringType: 'building' })

    expect(options.map((option) => option.value)).toEqual([DOCK_WARD.id, HARBORFORD.id])
  })
})
