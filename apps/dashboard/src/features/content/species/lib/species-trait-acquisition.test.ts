import { describe, expect, it } from 'vitest'

import {
  parseSpeciesTraitAcquisitionId,
  speciesTraitAcquisitionItems,
} from './species-trait-acquisition'
import type { TraitRowForm } from './species-trait-form-fields'

describe('speciesTraitAcquisitionItems', () => {
  it('marks an existing sense template as focus with already added copy', () => {
    const traits: TraitRowForm[] = [
      {
        kind: 'template',
        id: 'darkvision',
        templateId: 'sense-darkvision',
        config: { range: 60 },
        grants: [],
      },
    ]
    const items = speciesTraitAcquisitionItems('srd-cc-5.2.1', traits)
    const darkvision = items.find((item) => item.label === 'Darkvision')
    expect(darkvision?.id).toBe('focus:darkvision')
    expect(darkvision?.note).toBe('Already added')
    expect(darkvision?.groupId).toBe('senses')
  })

  it('parses focus and template acquisition ids', () => {
    expect(parseSpeciesTraitAcquisitionId('focus:darkvision')).toEqual({
      type: 'focus',
      traitId: 'darkvision',
    })
    expect(parseSpeciesTraitAcquisitionId('template:sense-blindsight')).toEqual({
      type: 'template',
      templateId: 'sense-blindsight',
    })
  })
})
