import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import {
  resolveStoredSchema,
  resolveWriteInputSchema,
  type ContentWriteConfig,
  type WriteEntityBase,
} from './content-write-config'

type TestEntity = WriteEntityBase & { name: string }

const publishBodySchema = z.object({ name: z.string().min(1) })
const draftBodySchema = z.object({ name: z.string() })

const publishInputSchema = publishBodySchema.extend({ slug: z.string().min(1) })
const draftInputSchema = draftBodySchema.extend({ slug: z.string().min(1) })
const updatePublishInputSchema = publishInputSchema.partial()
const updateDraftInputSchema = draftInputSchema.partial()

const publishStoredSchema = z.object({
  id: z.string(),
  slug: z.string(),
  source: z.literal('homebrew'),
  status: z.enum(['draft', 'published']),
  campaignId: z.string(),
  name: z.string().min(1),
})

const draftStoredSchema = publishStoredSchema.extend({
  name: z.string(),
})

const testConfig = {
  typeName: 'feats',
  createInputSchema: publishInputSchema,
  updateInputSchema: updatePublishInputSchema,
  createDraftInputSchema: draftInputSchema,
  updateDraftInputSchema,
  storedSchema: publishStoredSchema,
  draftStoredSchema,
} as unknown as ContentWriteConfig<TestEntity>

describe('resolveWriteInputSchema', () => {
  it('selects publish create/update schemas by default', () => {
    expect(resolveWriteInputSchema(testConfig, 'create', 'publish')).toBe(publishInputSchema)
    expect(resolveWriteInputSchema(testConfig, 'update', 'publish')).toBe(updatePublishInputSchema)
  })

  it('selects draft create/update schemas when registered', () => {
    expect(resolveWriteInputSchema(testConfig, 'create', 'draft')).toBe(draftInputSchema)
    expect(resolveWriteInputSchema(testConfig, 'update', 'draft')).toBe(updateDraftInputSchema)
  })

  it('falls back to publish schemas when draft siblings are absent', () => {
    const publishOnly = {
      createInputSchema: publishInputSchema,
      updateInputSchema: updatePublishInputSchema,
      storedSchema: publishStoredSchema,
    } as unknown as ContentWriteConfig<TestEntity>

    expect(resolveWriteInputSchema(publishOnly, 'create', 'draft')).toBe(publishInputSchema)
    expect(resolveWriteInputSchema(publishOnly, 'update', 'draft')).toBe(updatePublishInputSchema)
  })
})

describe('resolveStoredSchema', () => {
  it('returns draft stored schema for draft intent when registered', () => {
    expect(resolveStoredSchema(testConfig, 'draft')).toBe(draftStoredSchema)
  })

  it('returns publish stored schema for publish intent', () => {
    expect(resolveStoredSchema(testConfig, 'publish')).toBe(publishStoredSchema)
  })

  it('falls back to publish stored schema when draft sibling is absent', () => {
    const publishOnly = {
      storedSchema: publishStoredSchema,
    } as unknown as ContentWriteConfig<TestEntity>

    expect(resolveStoredSchema(publishOnly, 'draft')).toBe(publishStoredSchema)
  })
})
