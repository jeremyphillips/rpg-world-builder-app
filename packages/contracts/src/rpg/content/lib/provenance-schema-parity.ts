import type { z } from 'zod'

import { entryProvenanceSchema } from '../../primitives/provenance'
import type { ProvenanceEntryHostPath } from './content-type-capabilities'

type ZodLike = {
  def: { type: string; innerType?: ZodLike }
  shape?: Record<string, ZodLike>
  options?: readonly ZodLike[]
  element?: ZodLike
}

type ProvenanceFieldStatus = 'entry' | 'other' | 'absent'

function asZod(schema: z.ZodType): ZodLike {
  return schema as unknown as ZodLike
}

function unwrap(schema: ZodLike): ZodLike {
  const type = schema.def.type
  if (
    (type === 'optional' || type === 'default' || type === 'nullable' || type === 'prefault') &&
    schema.def.innerType
  ) {
    return unwrap(schema.def.innerType)
  }
  return schema
}

function isOptionalEntryProvenance(field: ZodLike | undefined): boolean {
  return (
    field?.def.type === 'optional' && field.def.innerType === (entryProvenanceSchema as unknown)
  )
}

function elementProvenanceStatus(schema: ZodLike | undefined): ProvenanceFieldStatus {
  if (!schema?.def) return 'absent'
  const inner = unwrap(schema)
  if (inner.def.type === 'union' && inner.options) {
    const statuses = inner.options.map((option) => elementProvenanceStatus(option))
    if (statuses.every((status) => status === 'absent')) return 'absent'
    if (statuses.every((status) => status === 'entry')) return 'entry'
    return 'other'
  }
  if (inner.def.type === 'object' && inner.shape) {
    if (!('provenance' in inner.shape)) return 'absent'
    return isOptionalEntryProvenance(inner.shape.provenance) ? 'entry' : 'other'
  }
  return 'absent'
}

function mergeFindings(
  maps: ReadonlyArray<ReadonlyMap<string, Exclude<ProvenanceFieldStatus, 'absent'>>>,
): Map<string, Exclude<ProvenanceFieldStatus, 'absent'>> {
  const keys = new Set(maps.flatMap((findings) => [...findings.keys()]))
  const merged = new Map<string, Exclude<ProvenanceFieldStatus, 'absent'>>()
  for (const key of keys) {
    const statuses = maps.map((findings) => findings.get(key) ?? 'absent')
    merged.set(key, statuses.every((status) => status === 'entry') ? 'entry' : 'other')
  }
  return merged
}

function findingsFromSchema(
  schema: ZodLike,
): Map<string, Exclude<ProvenanceFieldStatus, 'absent'>> {
  const inner = unwrap(schema)
  if (inner.def.type === 'union' && inner.options) {
    return mergeFindings(inner.options.map((option) => findingsFromSchema(option)))
  }
  if (!inner.shape) return new Map()
  const found = new Map<string, Exclude<ProvenanceFieldStatus, 'absent'>>()
  for (const [key, field] of Object.entries(inner.shape)) {
    const array = unwrap(field)
    if (array.def.type !== 'array' || !array.element) continue
    const status = elementProvenanceStatus(array.element)
    if (status !== 'absent') found.set(key, status)
  }
  return found
}

/** Top-level array fields whose elements include entry `provenance`. */
export function collectProvenanceEntryPaths(schema: z.ZodType): string[] {
  return [...findingsFromSchema(asZod(schema)).keys()].sort()
}

export function provenanceHostsMatchSchema(
  schema: z.ZodType,
  hosts: readonly ProvenanceEntryHostPath[],
): boolean {
  const findings = findingsFromSchema(asZod(schema))
  if ([...findings.values()].some((status) => status !== 'entry')) return false
  const found = [...findings.keys()].sort()
  const expected = [...hosts].sort()
  return found.length === expected.length && found.every((path, index) => path === expected[index])
}
