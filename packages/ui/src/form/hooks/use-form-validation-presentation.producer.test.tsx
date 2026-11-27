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
import { useFormValidationPresentation } from './use-form-validation-presentation.client'

const fields: FormItem[] = [{ type: 'text', name: 'name', label: 'Name', required: true }]

function shell({
  children,
  producer,
  publishPresentationIssues = [{ path: 'level', message: 'Legacy', severity: 'field' }],
}: {
  children: ReactNode
  producer?: { session: ReturnType<typeof createEmptyFormValidationProducerSession>; stamp: number }
  publishPresentationIssues?: { path: string; message: string; severity: 'field' }[]
}) {
  const form = useForm({ defaultValues: { name: '', level: 0 } })
  return (
    <FormProvider {...form}>
      <FormUiProvider
        fields={fields}
        hasAttemptedPublish
        publishPresentationEnabled
        publishPresentationIssues={publishPresentationIssues}
      >
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

describe('useFormValidationPresentation producer authority', () => {
  it('ignores parallel publishPresentationIssues when a producer session is mounted', () => {
    let session = createEmptyFormValidationProducerSession()
    session = replaceFormValidationProducerSlot(session, 'publish-readiness', 1, [
      { path: 'name', message: 'Name required', severity: 'field' },
    ])

    const { result } = renderHook(() => useFormValidationPresentation(), {
      wrapper: ({ children }) => shell({ children, producer: { session, stamp: 1 } }),
    })

    expect(result.current.issues.map((issue) => issue.path)).toEqual(['name'])
  })

  it('returns an empty list from producer projection when slots are clear', () => {
    const session = createEmptyFormValidationProducerSession()
    const { result } = renderHook(() => useFormValidationPresentation(), {
      wrapper: ({ children }) => shell({ children, producer: { session, stamp: 1 } }),
    })

    expect(result.current.issues).toEqual([])
  })
})
