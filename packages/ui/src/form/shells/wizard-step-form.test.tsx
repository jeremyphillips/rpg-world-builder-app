import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { z } from 'zod'

import { Wizard, type WizardStepDef } from '../../components/ui/wizard.client'
import { WizardStepForm } from './wizard-step-form.client'
import type { FormItem } from '../field-config'

const steps: WizardStepDef[] = [
  { id: 'one', label: 'One' },
  { id: 'two', label: 'Two' },
]

const stepOneSchema = z.object({ name: z.string().min(1, 'Name is required') })
const stepOneFields: FormItem[] = [{ type: 'text', name: 'name', label: 'Name' }]

const stepTwoSchema = z.object({ color: z.string().min(1, 'Color is required') })
const stepTwoFields: FormItem[] = [{ type: 'text', name: 'color', label: 'Color' }]

type StepOneValues = z.infer<typeof stepOneSchema>
type StepTwoValues = z.infer<typeof stepTwoSchema>

function renderWizard() {
  return render(
    <Wizard steps={steps} onComplete={vi.fn()}>
      <WizardStepForm<StepOneValues> schema={stepOneSchema} fields={stepOneFields} />
      <WizardStepForm<StepTwoValues> schema={stepTwoSchema} fields={stepTwoFields} />
    </Wizard>,
  )
}

describe('WizardStepForm', () => {
  it('disables Next until the step is valid, then advances on submit', async () => {
    const user = userEvent.setup()
    renderWizard()

    const next = screen.getByRole('button', { name: 'Next' })
    expect(next).toBeDisabled()

    await user.type(screen.getByLabelText('Name'), 'Tasha')
    await waitFor(() => expect(next).toBeEnabled())

    await user.click(next)
    expect(await screen.findByLabelText('Color')).toBeInTheDocument()
  })

  it('restores entered values when navigating Back to a completed step', async () => {
    const user = userEvent.setup()
    renderWizard()

    await user.type(screen.getByLabelText('Name'), 'Tasha')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await screen.findByLabelText('Color')

    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(await screen.findByLabelText('Name')).toHaveValue('Tasha')
  })

  it('has no axe violations', async () => {
    const { container } = renderWizard()
    await expectNoAxeViolations(container)
  })
})
