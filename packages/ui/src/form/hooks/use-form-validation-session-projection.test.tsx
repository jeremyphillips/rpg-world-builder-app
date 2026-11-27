/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { FormProvider, useForm } from 'react-hook-form'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'

import { FormUiProvider } from '../context/form-ui.context'
import type { FormItem } from '../field-config'
import {
  createEmptyFormValidationProducerSession,
  FormValidationProducerProvider,
  replaceFormValidationProducerSlot,
} from '../lifecycle'
import { useFormValidationSessionProjection } from './use-form-validation-session-projection.client'
import { useFieldIssue } from './use-field-issue.client'

const fields: FormItem[] = [{ type: 'text', name: 'name', label: 'Name', required: true }]

function shell({
  children,
  producer,
}: {
  children: ReactNode
  producer?: { session: ReturnType<typeof createEmptyFormValidationProducerSession>; stamp: number }
}) {
  const form = useForm({ defaultValues: { name: '' } })
  return (
    <FormProvider {...form}>
      <FormUiProvider fields={fields} hasAttemptedSubmit>
        {producer ? (
          <FormValidationProducerProvider session={producer.session} stamp={producer.stamp}>
            {children}
          </FormValidationProducerProvider>
        ) : (
          children
        )}
      </FormUiProvider>
    </FormProvider>
  )
}

describe('useFormValidationSessionProjection', () => {
  it('reads producer slots instead of RHF when a session is mounted', () => {
    let session = createEmptyFormValidationProducerSession()
    session = replaceFormValidationProducerSlot(session, 'publish-action', 1, [
      { path: 'name', message: 'Name required', severity: 'field' },
    ])

    const { result } = renderHook(() => useFormValidationSessionProjection(), {
      wrapper: ({ children }) => shell({ children, producer: { session, stamp: 1 } }),
    })

    expect(result.current.issues.map((issue) => issue.path)).toEqual(['name'])
    expect(result.current.usesProducerSession).toBe(true)
  })
})

describe('useFieldIssue session projection', () => {
  it('subscribes to the producer session for control messages', () => {
    let session = createEmptyFormValidationProducerSession()
    session = replaceFormValidationProducerSlot(session, 'interactive', 1, [
      {
        path: 'name',
        message: 'Name required',
        severity: 'field',
        claim: { kind: 'field', target: 'name' },
      },
    ])

    const { result } = renderHook(() => useFieldIssue('name'), {
      wrapper: ({ children }) => shell({ children, producer: { session, stamp: 1 } }),
    })

    expect(result.current.message).toBe('Name required')
    expect(result.current.hasIssue).toBe(true)
  })
})
