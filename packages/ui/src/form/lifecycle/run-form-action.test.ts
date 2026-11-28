import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import type { FormItem } from '../field-config'
import { evaluateFormSchema } from './form-schema-evaluator'
import { runFormAction } from './run-form-action'

const fields: FormItem[] = [{ type: 'text', name: 'name', label: 'Name', required: true }]

function current(stamp: number) {
  return { attempt: { stamp, attemptId: 1 }, readCurrent: () => ({ stamp, attemptId: 1 }) }
}

describe('runFormAction', () => {
  it('runs stages in order and passes prepared output to persist stage', async () => {
    const schema = z.object({ name: z.string().min(1) })

    const result = await runFormAction({
      ...current(1),
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
      ...current(2),
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

  it('rejects a stale stamp before running stages', async () => {
    const result = await runFormAction({
      attempt: { stamp: 1, attemptId: 1 },
      readCurrent: () => ({ stamp: 3, attemptId: 1 }),
      input: {},
      stages: [{ id: 'form', intent: 'draft', run: () => ({ kind: 'parsed', data: {} }) }],
    })
    expect(result).toEqual(expect.objectContaining({ kind: 'blocked', stageId: 'superseded' }))
  })

  it('supersedes a same-stamp attempt when a newer attempt starts mid-stage', async () => {
    let latest = 1
    const ran: string[] = []
    const result = await runFormAction({
      attempt: { stamp: 5, attemptId: 1 },
      readCurrent: () => ({ stamp: 5, attemptId: latest }),
      input: {},
      stages: [
        {
          id: 'first',
          intent: 'draft',
          run: async () => {
            ran.push('first')
            latest = 2
            await Promise.resolve()
            return { kind: 'parsed', data: {} }
          },
        },
        {
          id: 'second',
          intent: 'serialization',
          run: () => {
            ran.push('second')
            return { kind: 'parsed', data: {} }
          },
        },
      ],
    })
    expect(result).toEqual(expect.objectContaining({ kind: 'blocked', stageId: 'superseded' }))
    expect(ran).toEqual(['first'])
  })
})
