import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { MASTER_DETAIL_UNSELECTED_ROW_ERROR_MESSAGE } from '../../lib/master-detail/master-detail-constants'
import { MasterDetailValidationBanner } from './master-detail-validation-banner.client'

describe('MasterDetailValidationBanner', () => {
  it('renders nothing when not visible', () => {
    const { container } = render(<MasterDetailValidationBanner visible={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the shared validation message when visible', () => {
    render(<MasterDetailValidationBanner visible />)
    expect(screen.getByRole('alert')).toHaveTextContent(MASTER_DETAIL_UNSELECTED_ROW_ERROR_MESSAGE)
  })

  itAxe('has no axe accessibility violations when visible', async () => {
    const { container } = render(<MasterDetailValidationBanner visible />)
    await expectNoAxeViolations(container)
  })
})
