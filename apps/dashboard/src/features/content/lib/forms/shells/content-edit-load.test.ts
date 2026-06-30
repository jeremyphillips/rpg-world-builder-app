import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defaultMulticlassingRules } from '@rpg/contracts'

import type { ContentFormDef, ContentFormCtx } from '../content-form-registry'
import {
  findContentEditEntity,
  loadContentEditFormState,
  resolveContentFormSchema,
} from './content-edit-load'

const baseOptionsCtx: ContentFormCtx = {
  campaignRules: {
    maxCharacterLevel: 20,
    standardMaxCharacterLevel: 20,
    allowedCharacterCreatureTypes: ['humanoid'],
    multiclassing: defaultMulticlassingRules(),
  },
}

describe('findContentEditEntity', () => {
  it('returns the entity matching entityId', () => {
    const entities = [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' },
    ]
    expect(findContentEditEntity(entities, 'b')).toEqual({ id: 'b', name: 'Beta' })
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
})

describe('loadContentEditFormState', () => {
  const entity = {
    id: 'sp-1',
    name: 'Elf',
    source: 'homebrew' as const,
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
