import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { defaultCampaignRules } from '../../../form-options/content-campaign-rules'
import type { ContentFormDef, ContentFormCtx } from '../../registry/content-form-registry'
import {
  findContentEditEntity,
  loadContentEditFormState,
  resolveContentFormSchema,
} from './content-edit-load'

const baseOptionsCtx: ContentFormCtx = {
  campaignRules: defaultCampaignRules(),
}

describe('findContentEditEntity', () => {
  it('returns the entity matching entityId', () => {
    const entities = [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' },
    ]
    expect(findContentEditEntity(entities, 'b')).toEqual({ id: 'b', name: 'Beta' })
  })

  it('returns undefined when a draft is absent from the cached list', () => {
    const entities = [{ id: 'pub-1', name: 'Published only', status: 'published' as const }]
    expect(findContentEditEntity(entities, 'draft-1')).toBeUndefined()
  })

  it('returns undefined when the list is missing or empty', () => {
    expect(findContentEditEntity(undefined, 'a')).toBeUndefined()
    expect(findContentEditEntity([], 'a')).toBeUndefined()
  })
})

describe('resolveContentFormSchema', () => {
  it('uses resolveSchema when present', () => {
    const campaignSchema = z.object({ name: z.string(), level: z.number() })
    const def = {
      schema: z.object({ name: z.string() }),
      resolveSchema: () => campaignSchema,
    } as Pick<
      ContentFormDef<{ id: string; name: string }, { name: string }, unknown>,
      'schema' | 'resolveSchema'
    >

    expect(resolveContentFormSchema(def, baseOptionsCtx)).toBe(campaignSchema)
  })

  it('falls back to schema when resolveSchema is omitted', () => {
    const schema = z.object({ name: z.string() })
    const def = { schema } as Pick<
      ContentFormDef<{ id: string; name: string }, { name: string }, unknown>,
      'schema'
    >

    expect(resolveContentFormSchema(def, baseOptionsCtx)).toBe(schema)
  })

  it('falls back to publish schema when draftSchema is absent', () => {
    const schema = z.object({ name: z.string().min(1) })
    const def = { schema } as Pick<
      ContentFormDef<{ id: string; name: string }, { name: string }, unknown>,
      'schema' | 'draftSchema'
    >

    expect(resolveContentFormSchema(def, baseOptionsCtx, 'draft')).toBe(schema)
  })

  it('uses draftSchema when intent is draft and draftSchema is registered', () => {
    const schema = z.object({ name: z.string().min(1) })
    const draftSchema = z.object({ name: z.string() })
    const def = { schema, draftSchema } as Pick<
      ContentFormDef<{ id: string; name: string }, { name: string }, unknown>,
      'schema' | 'draftSchema'
    >

    expect(resolveContentFormSchema(def, baseOptionsCtx, 'draft')).toBe(draftSchema)
    expect(resolveContentFormSchema(def, baseOptionsCtx, 'publish')).toBe(schema)
  })
})

describe('loadContentEditFormState', () => {
  const entity = {
    id: 'sp-1',
    name: 'Elf',
    source: 'homebrew' as const,
    status: 'published' as const,
    slug: 'elf',
    kind: 'service',
  }

  it('builds layout context, schema, and stripped defaults', () => {
    const schema = z.object({
      name: z.string(),
      slug: z.string().optional(),
      kind: z.string().optional(),
    })
    const def = {
      schema,
      toFormValues: () => ({ name: 'Elf', slug: 'elf', kind: 'service' }),
      extractEmbeddedSeedRowIds: () => ({ traits: ['t1'] }),
    } as unknown as ContentFormDef<typeof entity, { name: string }, unknown>

    const result = loadContentEditFormState({
      def,
      entity,
      optionsCtx: baseOptionsCtx,
      formCtx: { equipmentKind: 'weapon' },
      campaignId: 'camp-1',
      entityId: 'sp-1',
    })

    expect(result.layoutCtx).toMatchObject({
      campaignId: 'camp-1',
      entityId: 'sp-1',
      mode: 'edit',
      entitySource: 'homebrew',
      equipmentKind: 'weapon',
      embeddedSeedRowIds: { traits: ['t1'] },
    })
    expect(result.schema).toBe(schema)
    expect(result.defaultValues).toEqual({ name: 'Elf' })
  })

  it('strips kind when equipmentKind is resolved on the layout context', () => {
    const def = {
      schema: z.object({ name: z.string(), kind: z.string().optional() }),
      toFormValues: () => ({ name: 'Chain Mail', kind: 'armor' }),
    } as unknown as ContentFormDef<typeof entity, { name: string; kind?: string }, unknown>

    const result = loadContentEditFormState({
      def,
      entity,
      optionsCtx: baseOptionsCtx,
      campaignId: 'camp-1',
      entityId: 'sp-1',
    })

    expect(result.defaultValues).toEqual({ name: 'Chain Mail' })
  })
})
