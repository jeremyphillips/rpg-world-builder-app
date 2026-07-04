import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import type { FormItem } from '../field-config'
import {
  assertInvalidSubmitUsesRefinedMessages,
  assertRegistryCoverage,
  collectValidationIssues,
  expectNoDefaultZodMessages,
} from './form-validation-test-utils'
import { collectSchemaLeafPaths } from './collect-schema-paths.lib'

const fields: FormItem[] = [
  { type: 'text', name: 'name', label: 'Name', required: true },
  {
    kind: 'array',
    name: 'items',
    legend: 'Items',
    fields: [{ type: 'text', name: 'label', label: 'Item label', required: true }],
  },
]

const schema = z.object({
  name: z.string().min(1),
  items: z.array(z.object({ label: z.string().min(1) })).min(1),
})

describe('form validation test utils', () => {
  it('collectSchemaLeafPaths normalizes array indices to *', () => {
    expect(collectSchemaLeafPaths(schema).sort()).toEqual(['items', 'items.*.label', 'name'])
  })

  it('expectNoDefaultZodMessages rejects Zod default copy', () => {
    expect(() => expectNoDefaultZodMessages(['Invalid input'])).toThrow()
    expect(() => expectNoDefaultZodMessages(['Name is required.'])).not.toThrow()
  })

  it('assertRegistryCoverage passes when schema paths are registered', () => {
    expect(() => assertRegistryCoverage(schema, fields)).not.toThrow()
  })

  it('assertRegistryCoverage fails on uncovered schema paths', () => {
    const sparseFields: FormItem[] = [{ type: 'text', name: 'name', label: 'Name' }]
    expect(() => assertRegistryCoverage(schema, sparseFields)).toThrow(/Unregistered schema paths/)
  })

  it('assertInvalidSubmitUsesRefinedMessages rejects empty submit without Zod defaults', () => {
    expect(() => assertInvalidSubmitUsesRefinedMessages(schema, fields)).not.toThrow()

    const messages = collectValidationIssues(schema, {}, fields).map((issue) => issue.message)
    expect(messages.length).toBeGreaterThan(0)
    expectNoDefaultZodMessages(messages)
  })
})
