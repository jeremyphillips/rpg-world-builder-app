import { describe, expect, it } from 'vitest'

import { CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN } from '../../classes/lib/class-feature-form-labels'
import { TRAIT_MASTER_DETAIL_ITEM_NOUN } from '../../species/lib/species-trait-form-labels'
import {
  masterDetailEmptyListLabel,
  masterDetailEmptySelectionHeading,
  masterDetailEmptySelectionSubhead,
  masterDetailItemNounLabel,
  masterDetailItemTitle,
  masterDetailUnnamedItemTitle,
} from './master-detail-constants'

describe('masterDetail empty-state copy', () => {
  it('formats list empty copy from vocabulary terms', () => {
    expect(masterDetailEmptyListLabel(TRAIT_MASTER_DETAIL_ITEM_NOUN)).toBe('No traits added.')
    expect(masterDetailEmptyListLabel(CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN)).toBe(
      'No features added.',
    )
  })

  it('formats detail empty copy from vocabulary terms', () => {
    expect(masterDetailEmptySelectionHeading(TRAIT_MASTER_DETAIL_ITEM_NOUN)).toBe(
      'Add a trait to begin',
    )
    expect(masterDetailEmptySelectionSubhead(TRAIT_MASTER_DETAIL_ITEM_NOUN)).toBe(
      'Select a trait to edit once traits have been added.',
    )
  })

  it('derives singular labels for destructive actions', () => {
    expect(masterDetailItemNounLabel(TRAIT_MASTER_DETAIL_ITEM_NOUN)).toBe('trait')
  })

  it('formats unnamed row titles from vocabulary labels', () => {
    expect(masterDetailUnnamedItemTitle(TRAIT_MASTER_DETAIL_ITEM_NOUN)).toBe('Unnamed Trait')
    expect(masterDetailUnnamedItemTitle(CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN)).toBe(
      'Unnamed Feature',
    )
    expect(masterDetailItemTitle('  ', TRAIT_MASTER_DETAIL_ITEM_NOUN)).toBe('Unnamed Trait')
    expect(masterDetailItemTitle('Darkvision', TRAIT_MASTER_DETAIL_ITEM_NOUN)).toBe('Darkvision')
  })
})
