import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Wizard, type WizardStepDef } from '@rpg/ui'

import { ReviewStep } from '../review-step'

const STEPS: WizardStepDef[] = [{ id: 'review', label: 'Review' }]

function renderStep() {
  return render(
    <Wizard steps={STEPS} onComplete={vi.fn()}>
      <ReviewStep />
    </Wizard>,
  )
}

describe('ReviewStep', () => {
  it('renders review metadata at sm density', () => {
    renderStep()

    const nameLabel = screen.getByText('Name')
    expect(nameLabel.closest('dl')).toHaveClass('ui-metadata-list--sm')
    expect(nameLabel.tagName).toBe('DT')
    expect(nameLabel.nextElementSibling?.tagName).toBe('DD')
  })
})
