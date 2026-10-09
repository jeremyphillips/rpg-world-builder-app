import { describe, expect, it } from 'vitest'

import { PROFICIENCY_TERM } from '../../vocab/proficiency'
import {
  catalogNounFromContentType,
  catalogNounFromTerm,
  formatCatalogPickerCopy,
} from './format-catalog-picker-copy'

describe('formatCatalogPickerCopy', () => {
  it('builds organization picker chrome from the content-type noun', () => {
    const noun = catalogNounFromContentType('organizations')
    const copy = formatCatalogPickerCopy(noun, {
      noResultsMessage: `No ${noun.plural} match this view.`,
    })

    expect(noun).toEqual({
      label: 'Organization',
      singular: 'organization',
      plural: 'organizations',
    })
    expect(copy.chooseTitle).toBe('Choose organization')
    expect(copy.addLabel).toBe('Add organization')
    expect(copy.searchPlaceholder).toBe('Search organizations')
    expect(copy.noResultsMessage).toBe('No organizations match this view.')
    expect(copy.noItemsMessage).toBe('No organizations are available.')
    expect(copy.noOptionsMessage).toBe('No organizations are available for this choice.')
    expect(copy.selectionFullMessage).toBe(
      'You have selected the maximum number of organizations for this choice.',
    )
  })

  it('keeps invariant plurals and ignores undefined overrides', () => {
    const noun = catalogNounFromContentType('equipment')
    const copy = formatCatalogPickerCopy(noun, { noResultsMessage: undefined })

    expect(noun.plural).toBe('equipment')
    expect(copy.searchPlaceholder).toBe('Search equipment')
    expect(copy.noResultsMessage).toBe('No equipment match your search.')
  })

  it('builds proficiency chrome from a vocabulary term', () => {
    const copy = formatCatalogPickerCopy(catalogNounFromTerm(PROFICIENCY_TERM))

    expect(copy.noOptionsMessage).toBe('No proficiencies are available for this choice.')
    expect(copy.selectionFullMessage).toBe(
      'You have selected the maximum number of proficiencies for this choice.',
    )
  })
})
