/**
 * @vitest-environment jsdom
 */
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { FormProvider, useForm } from 'react-hook-form'
import { act, render, waitFor } from '@testing-library/react'
import { z } from 'zod'

import { FormUiProvider } from '../context/form-ui.context'
import type { FormItem } from '../field-config'
import {
  createEmptyFormValidationProducerSession,
  replaceFormValidationProducerSlot,
} from './form-validation-producer-session.lib'
import { FormValidationProducerProvider } from './form-validation-producer-context.client'
import type { FormIssue } from '../errors/form-issue.types'
import type { FormValidationProducerSlot } from '../form-evaluation.types'
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

      React.useLayoutEffect(() => {
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

  it('does not loop replaceSlot when the producer session updates', async () => {
    const replaceSlotSpy = vi.fn()

    function BridgeHost() {
      const form = useForm({ defaultValues: { name: '' } })
      const [session, setSession] = React.useState(() => createEmptyFormValidationProducerSession())
      const replaceSlot = React.useCallback(
        (slot: FormValidationProducerSlot, issues: readonly FormIssue[]) => {
          replaceSlotSpy(slot, issues)
          setSession((prev) => replaceFormValidationProducerSlot(prev, slot, 1, issues))
        },
        [],
      )

      React.useLayoutEffect(() => {
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
      expect(replaceSlotSpy).toHaveBeenCalled()
    })

    const callsAfterSettle = replaceSlotSpy.mock.calls.length

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    expect(replaceSlotSpy.mock.calls.length).toBe(callsAfterSettle)
  })
})
