import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { ReviewAdvisoryWarnings } from './review-advisory-warnings'

describe('ReviewAdvisoryWarnings', () => {
  it('renders nothing when there are no warnings', () => {
    const { container } = render(<ReviewAdvisoryWarnings notes={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('lists advisory warnings', () => {
    render(
      <ReviewAdvisoryWarnings
        notes={['Your Constitution is low for Barbarian.', 'You have no martial weapons.']}
      />,
    )

    expect(screen.getByText('Advisory notes')).toBeInTheDocument()
    expect(screen.getByText('Your Constitution is low for Barbarian.')).toBeInTheDocument()
    expect(screen.getByText('You have no martial weapons.')).toBeInTheDocument()
  })

  it('lists build advisories alongside notes', () => {
    render(
      <ReviewAdvisoryWarnings
        advisories={[
          {
            code: 'equipment_not_proficient',
            subject: {
              kind: 'equipment',
              equipmentId: 'srd-cc-5.2.1:shield',
              label: 'Shield',
              equipmentClass: 'shield',
            },
          },
        ]}
        notes={['Unarmored Defense may change AC; not reflected in preview.']}
      />,
    )

    expect(screen.getByText('Shield — Not proficient with this shield')).toBeInTheDocument()
    expect(
      screen.getByText('Unarmored Defense may change AC; not reflected in preview.'),
    ).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <ReviewAdvisoryWarnings notes={['Your Constitution is low for Barbarian.']} />,
    )

    await expectNoAxeViolations(container)
  })
})
