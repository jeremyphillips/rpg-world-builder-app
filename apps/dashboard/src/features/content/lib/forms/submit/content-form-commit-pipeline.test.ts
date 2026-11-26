import { describe, expect, it, vi } from 'vitest'
import type { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import type { FormItem } from '@rpg/ui/form'

import { runContentFormCommitPipeline } from './content-form-commit-pipeline.lib'
import { buildIdentityPreparedWrite } from './content-prepared-write.types'

const fields: FormItem[] = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'level', label: 'Level', type: 'number' },
]

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  level: z.number().min(1, 'Level is required.'),
})

type Values = z.infer<typeof formSchema>

function stubForm(): UseFormReturn<Values> {
  return {
    clearErrors: vi.fn(),
    setError: vi.fn(),
    getValues: vi.fn(),
    formState: { errors: {} },
  } as unknown as UseFormReturn<Values>
}

function attemptOf(stamp: number, liveStamp = stamp) {
  return {
    attempt: { stamp, attemptId: 1 },
    readCurrent: () => ({ stamp: liveStamp, attemptId: 1 }),
  }
}

describe('runContentFormCommitPipeline', () => {
  it('runs evaluate and prepare once with identity provenance', async () => {
    const pipeline = await runContentFormCommitPipeline(
      { values: { name: 'A', level: 2 }, form: stubForm() },
      {
        ...attemptOf(10),
        formSchema,
        resolverFields: fields,
        producerSlot: 'publish-action',
        prepareCommitValues: (values) => ({ ...values, name: values.name.trim() }),
      },
    )

    expect(pipeline.kind).toBe('success')
    if (pipeline.kind === 'success') {
      expect(pipeline.prepared).toEqual(buildIdentityPreparedWrite({ name: 'A', level: 2 }))
      expect(pipeline.action.stageOutputs.prepare).toEqual(pipeline.prepared)
    }
  })

  it('blocks before prepare when form evaluation fails', async () => {
    const pipeline = await runContentFormCommitPipeline(
      { values: { name: '', level: 0 }, form: stubForm() },
      {
        ...attemptOf(11),
        formSchema,
        resolverFields: fields,
        producerSlot: 'publish-action',
      },
    )

    expect(pipeline).toEqual(
      expect.objectContaining({
        kind: 'blocked',
        stageId: 'form-evaluate',
      }),
    )
    if (pipeline.kind === 'blocked') {
      expect(pipeline.issues?.length).toBeGreaterThan(0)
    }
  })

  it('rejects stale stamp before running stages', async () => {
    const pipeline = await runContentFormCommitPipeline(
      { values: { name: 'A', level: 2 }, form: stubForm() },
      {
        ...attemptOf(99, 12),
        formSchema,
        resolverFields: fields,
        producerSlot: 'publish-action',
      },
    )

    expect(pipeline).toEqual(
      expect.objectContaining({
        kind: 'blocked',
        stageId: 'superseded',
      }),
    )
  })

  it('validates write schema on prepared payload when provided', async () => {
    const writeSchema = z.object({
      name: z.string().min(1),
      level: z.number().min(5, 'Level must be at least 5 for publish.'),
    })
    const pipeline = await runContentFormCommitPipeline(
      { values: { name: 'A', level: 2 }, form: stubForm() },
      {
        ...attemptOf(13),
        formSchema,
        writeSchema,
        resolverFields: fields,
        producerSlot: 'publish-action',
      },
    )

    expect(pipeline).toEqual(
      expect.objectContaining({
        kind: 'blocked',
        stageId: 'write-validate',
      }),
    )
  })

  it('returns the write-schema parsed payload, not the pre-parse object', async () => {
    const writeSchema = z.object({ name: z.string().trim(), level: z.coerce.number() })
    const pipeline = await runContentFormCommitPipeline(
      { values: { name: 'A', level: 2 }, form: stubForm() },
      {
        ...attemptOf(14),
        formSchema,
        writeSchema,
        resolverFields: fields,
        producerSlot: 'publish-action',
        prepareWrite: () =>
          buildIdentityPreparedWrite({ name: '  Hero ', level: '7', extra: true }),
      },
    )

    expect(pipeline.kind).toBe('success')
    if (pipeline.kind === 'success') {
      expect(pipeline.prepared.payload).toEqual({ name: 'Hero', level: 7 })
    }
  })
})
