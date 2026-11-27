/**
 * @vitest-environment jsdom
 */
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { FormProvider, useForm } from 'react-hook-form'
import { render, waitFor } from '@testing-library/react'
import { z } from 'zod'

import { FormUiProvider } from '../context/form-ui.context'
import type { FormItem } from '../field-config'
import { createEmptyFormValidationProducerSession } from './form-validation-producer-session.lib'
import { FormValidationProducerProvider } from './form-validation-producer-context.client'
import { FormValidationInteractiveProducerBridge } from './form-validation-interactive-producer-bridge.client'
import { createValidateSilently } from '../config/form-resolver'

const schema = z.object({ name: z.string().min(1, 'Name is required.') })
const fields: FormItem[] = [{ type: 'text', name: 'name', label: 'Name', required: true }]

describe('interactive producer slot', () => {
  it('does not publish from createValidateSilently', async () => {
    const validateSilently = createValidateSilently(schema, fields)
    expect(await validateSilently({ name: '' })).toEqual({ valid: false })
  })

  it('publishes interactive issues after an explicit submit attempt', async () => {
    const replaceSlot = vi.fn()

    function BridgeHost() {
      const form = useForm({ defaultValues: { name: '' } })
      const session = createEmptyFormValidationProducerSession()

      React.useEffect(() => {
        form.setError('name', { type: 'custom', message: 'Name required' })
      }, [form])

      return (
        <FormProvider {...form}>
          <FormUiProvider fields={fields} hasAttemptedSubmit>
            <FormValidationProducerProvider session={session} stamp={1} replaceSlot={replaceSlot}>
              <FormValidationInteractiveProducerBridge fields={fields} />
            </FormValidationProducerProvider>
          </FormUiProvider>
        </FormProvider>
      )
    }

    render(<BridgeHost />)

    await waitFor(() => {
      expect(replaceSlot).toHaveBeenCalledWith(
        'interactive',
        expect.arrayContaining([expect.objectContaining({ path: 'name' })]),
      )
    })
  })
})
