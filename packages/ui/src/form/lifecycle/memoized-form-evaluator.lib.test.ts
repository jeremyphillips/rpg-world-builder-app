import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import type { FormItem } from '../field-config'
import * as formSchemaEvaluator from './form-schema-evaluator'
import { createMemoizedFormEvaluator } from './memoized-form-evaluator.lib'

const fields: FormItem[] = [{ name: 'name', label: 'Name', type: 'text' }]

describe('createMemoizedFormEvaluator', () => {
  it('FV-022-parse-record: equivalent snapshots share one parse; distinct snapshots parse again', () => {
    const parseSpy = vi.spyOn(formSchemaEvaluator, 'evaluateFormSchema')
    const schema = z.object({ name: z.string().min(1) })
    const evaluate = createMemoizedFormEvaluator(schema, fields)

    const shared = { name: 'alpha' }
    evaluate(shared)
    evaluate({ name: 'alpha' })
    evaluate(structuredClone(shared))

    evaluate({ name: 'beta' })

    const distinctSchemaEvaluator = createMemoizedFormEvaluator(
      z.object({ name: z.string().min(2) }),
      fields,
    )
    distinctSchemaEvaluator({ name: 'gamma' })

    expect(parseSpy).toHaveBeenCalledTimes(3)
    parseSpy.mockRestore()
  })
})
