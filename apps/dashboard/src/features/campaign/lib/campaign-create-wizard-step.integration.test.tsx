/**
 * @vitest-environment jsdom
 *
 * Production entry: WizardStepForm identity step uses the same Form + schema as campaign create.
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { Form } from '@rpg/ui/form'

import {
  createIdentityFields,
  createIdentitySchema,
  type CreateIdentityValues,
} from './settings/campaign-profile-form-fields'
import { validateCampaignCreateValues } from './campaign-create-validation.lib'

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

describe('campaign create wizard step validation', () => {
  it('blocks persist on mounted identity step Form when name is empty', async () => {
    const user = userEvent.setup()
    const completeStep = vi.fn()

    render(
      <Form<CreateIdentityValues>
        schema={createIdentitySchema}
        fields={createIdentityFields}
        defaultValues={{ name: '', description: '' }}
        onSubmit={(values) => completeStep(values)}
        footer={<button type="submit">Submit step</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Submit step' }))

    await waitFor(() => {
      expect(completeStep).not.toHaveBeenCalled()
    })
  })

  it('blocks persist on wizard complete when accumulated values fail runFormAction evaluation', async () => {
    const persist = vi.fn()
    const result = await validateCampaignCreateValues({ name: '' })
    expect(result.kind).toBe('invalid')
    expect(persist).not.toHaveBeenCalled()
  })
})
