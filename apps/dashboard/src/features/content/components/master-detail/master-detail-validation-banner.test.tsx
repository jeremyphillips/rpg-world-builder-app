import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import { MASTER_DETAIL_UNSELECTED_ROW_ERROR_MESSAGE } from '../../lib/master-detail/master-detail-constants'
import { MasterDetailValidationBanner } from './master-detail-validation-banner.client'

const axeOptions = { rules: { 'color-contrast': { enabled: false } } }

describe('MasterDetailValidationBanner', () => {
  it('renders nothing when not visible', () => {
    const { container } = render(<MasterDetailValidationBanner visible={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the shared validation message when visible', () => {
    render(<MasterDetailValidationBanner visible />)
    expect(screen.getByRole('alert')).toHaveTextContent(MASTER_DETAIL_UNSELECTED_ROW_ERROR_MESSAGE)
  })

  it('has no axe accessibility violations when visible', async () => {
    const { container } = render(<MasterDetailValidationBanner visible />)
    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
  })
})
