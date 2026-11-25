import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import type { FormItem } from '../field-config'
import { evaluateFormSchema } from './form-schema-evaluator'
import { runFormAction } from './run-form-action'

const fields: FormItem[] = [{ type: 'text', name: 'name', label: 'Name', required: true }]

describe('runFormAction', () => {
  it('runs stages in order and passes prepared output to persist stage', async () => {
    const schema = z.object({ name: z.string().min(1) })

    const result = await runFormAction({
      stamp: 1,
      input: { name: 'Prepared' },
      stages: [
        {
          id: 'form',
          intent: 'draft',
          run: (input) => {
            const evaluated = evaluateFormSchema(schema, input, { items: fields })
            if (evaluated.kind !== 'parsed') {
              return {
                kind: 'invalid',
                issues: evaluated.kind === 'invalid' ? evaluated.issues : [],
              }
            }
            return { kind: 'parsed', data: evaluated.data }
          },
        },
        {
          id: 'prepare',
          intent: 'serialization',
          run: (input) => {
            const value = input as { name: string }
            return {
              kind: 'parsed',
              data: { ...value, name: value.name.toUpperCase() },
            }
          },
        },
      ],
    })

    expect(result.kind).toBe('success')
    if (result.kind === 'success') {
      expect(result.data).toEqual({ name: 'PREPARED' })
      expect(result.stageOutputs.prepare).toEqual({ name: 'PREPARED' })
    }
  })

  it('stops at the first invalid stage', async () => {
    const schema = z.object({ name: z.string().min(1) })

    const result = await runFormAction({
      stamp: 2,
      input: { name: '' },
      stages: [
        {
          id: 'form',
          intent: 'draft',
          run: (input) => {
            const evaluated = evaluateFormSchema(schema, input, { items: fields })
            if (evaluated.kind !== 'parsed') {
              return {
                kind: 'invalid',
                issues: evaluated.kind === 'invalid' ? evaluated.issues : [],
              }
            }
            return { kind: 'parsed', data: evaluated.data }
          },
        },
        {
          id: 'prepare',
          intent: 'serialization',
          run: () => ({ kind: 'parsed', data: {} }),
        },
      ],
    })

    expect(result).toEqual(
      expect.objectContaining({
        kind: 'blocked',
        stageId: 'form',
      }),
    )
  })

  it('rejects stale stamp before running stages', async () => {
    const result = await runFormAction({
      stamp: 3,
      requiredStamp: 1,
      input: {},
      stages: [
        {
          id: 'form',
          intent: 'draft',
          run: () => ({ kind: 'parsed', data: {} }),
        },
      ],
    })

    expect(result).toEqual(
      expect.objectContaining({
        kind: 'blocked',
        stageId: 'stamp',
      }),
    )
  })
})
