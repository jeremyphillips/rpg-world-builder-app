import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TRAIT_MASTER_DETAIL_ITEM_NOUN } from '../../../species/lib/species-trait-form-labels'
import {
  masterDetailEmptySelectionHeading,
  masterDetailEmptySelectionSubhead,
} from '../../../lib/master-detail/master-detail-constants'
import { MasterDetailEditorEmptyState } from '../master-detail-editor-empty-state'

describe('MasterDetailEditorEmptyState', () => {
  it('renders centered empty-selection guidance from vocabulary terms', () => {
    render(<MasterDetailEditorEmptyState itemNoun={TRAIT_MASTER_DETAIL_ITEM_NOUN} />)

    expect(
      screen.getByText(masterDetailEmptySelectionHeading(TRAIT_MASTER_DETAIL_ITEM_NOUN)),
    ).toBeInTheDocument()
    expect(
      screen.getByText(masterDetailEmptySelectionSubhead(TRAIT_MASTER_DETAIL_ITEM_NOUN)),
    ).toBeInTheDocument()
  })
})
