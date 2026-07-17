import { describe, expect, it } from 'vitest'

import {
  findEnumOnlyRefs,
  isEnumOnlyDefinition,
  postProcessJsonSchema,
} from './json-schema-post-process'

describe('isEnumOnlyDefinition', () => {
  it('accepts string enums and consts', () => {
    expect(isEnumOnlyDefinition({ type: 'string', enum: ['a'] })).toBe(true)
    expect(isEnumOnlyDefinition({ type: 'string', const: 'a' })).toBe(true)
  })

  it('rejects unconstrained strings and non-string schemas', () => {
    expect(isEnumOnlyDefinition({ type: 'string' })).toBe(false)
    expect(isEnumOnlyDefinition({ type: 'integer', enum: [1] })).toBe(false)
  })
})

describe('postProcessJsonSchema', () => {
  const input = {
    type: 'object',
    properties: {
      mode: { $ref: '#/definitions/Mode' },
      label: { $ref: '#/definitions/Label' },
    },
    definitions: {
      Mode: {
        type: 'string',
        enum: ['free_cast'],
        description: '- **free_cast**: Cast without expending a spell slot.',
      },
      Label: {
        type: 'string',
        minLength: 1,
      },
    },
  }

  it('inlines enum-only refs and promotes markdown descriptions for VS Code hover', () => {
    const output = postProcessJsonSchema(input)

    expect(output.properties.mode).toEqual({
      type: 'string',
      enum: ['free_cast'],
      markdownDescription: '- **free_cast**: Cast without expending a spell slot.',
    })
    expect(output.properties.label).toEqual({ $ref: '#/definitions/Label' })
    expect(findEnumOnlyRefs(output)).toEqual([])
  })

  it('leaves plain-text descriptions on non-markdown fields', () => {
    const output = postProcessJsonSchema({
      type: 'object',
      properties: {
        note: {
          type: 'string',
          description: 'Plain helper text without markdown.',
        },
      },
    })

    expect(output.properties.note).toEqual({
      type: 'string',
      description: 'Plain helper text without markdown.',
    })
  })

  it('synthesizes descriptions for bare enums without Zod describe', () => {
    const output = postProcessJsonSchema({
      type: 'object',
      properties: {
        kind: {
          type: 'string',
          enum: ['fixed', 'choice'],
        },
        mode: {
          type: 'string',
          const: 'grant',
        },
      },
    })

    expect(output.properties.kind).toEqual({
      type: 'string',
      enum: ['fixed', 'choice'],
      description: 'fixed | choice',
    })
    expect(output.properties.mode).toEqual({
      type: 'string',
      const: 'grant',
      description: 'grant',
    })
  })

  it('promotes union branch descriptions with markdown', () => {
    const output = postProcessJsonSchema({
      type: 'object',
      properties: {
        grant: {
          description: 'Branch on **kind**: **fixed** | **choice**',
        },
      },
    })

    expect(output.properties.grant).toEqual({
      markdownDescription: 'Branch on **kind**: **fixed** | **choice**',
    })
  })
})
