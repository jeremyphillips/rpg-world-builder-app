import type { z } from 'zod'

import type { ProvenanceEntryHostPath } from './content-type-capabilities'

type ZodLike = {
  def: { type: string; innerType?: ZodLike }
  shape?: Record<string, ZodLike>
  options?: readonly ZodLike[]
  element?: ZodLike
}

function asZod(schema: z.ZodType): ZodLike {
  return schema as unknown as ZodLike
}

function unwrap(schema: ZodLike): ZodLike {
  const type = schema.def.type
  if ((type === 'optional' || type === 'default' || type === 'nullable') && schema.def.innerType) {
    return unwrap(schema.def.innerType)
  }
  return schema
}

function objectHasProvenance(schema: ZodLike | undefined): boolean {
  if (!schema?.def) return false
  const inner = unwrap(schema)
  if (inner.def.type === 'object' && inner.shape) return 'provenance' in inner.shape
  if (inner.def.type !== 'union' || !inner.options) return false
  return inner.options.length > 0 && inner.options.every((option) => objectHasProvenance(option))
}

/** Top-level array fields whose elements include entry `provenance`. */
export function collectProvenanceEntryPaths(schema: z.ZodType): string[] {
  const object = unwrap(asZod(schema))
  if (!object.shape) return []
  const paths: string[] = []
  for (const [key, field] of Object.entries(object.shape)) {
    const array = unwrap(field)
    if (array.def.type !== 'array' || !array.element) continue
    if (objectHasProvenance(array.element)) paths.push(key)
  }
  return paths.sort()
}

export function provenanceHostsMatchSchema(
  schema: z.ZodType,
  hosts: readonly ProvenanceEntryHostPath[],
): boolean {
  const found = collectProvenanceEntryPaths(schema)
  const expected = [...hosts].sort()
  return found.length === expected.length && found.every((path, index) => path === expected[index])
}
