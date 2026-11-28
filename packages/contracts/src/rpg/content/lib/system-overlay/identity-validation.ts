import type { SchemaFact } from './schema-tree'
import type { OverlayIdentityMeta } from './annotate'

type ZodLike = {
  def: {
    type: string
    innerType?: ZodLike
    out?: ZodLike
    schema?: ZodLike
    checks?: unknown[]
    shape?: Record<string, ZodLike>
  }
  shape?: Record<string, ZodLike>
}

function unwrapCore(schema: ZodLike): ZodLike {
  let current = schema
  for (let guard = 0; guard < 16; guard += 1) {
    const type = current.def.type
    if (
      current.def.innerType &&
      (type === 'optional' || type === 'default' || type === 'nullable' || type === 'prefault')
    ) {
      current = current.def.innerType
      continue
    }
    if (type === 'pipe' && current.def.out) {
      current = current.def.out
      continue
    }
    if (type === 'transform' && current.def.schema) {
      current = current.def.schema
      continue
    }
    break
  }
  return current
}

function isStringLike(schema: ZodLike): boolean {
  const core = unwrapCore(schema)
  return (
    core.def.type === 'string' || (core.def.type === 'string' && Array.isArray(core.def.checks))
  )
}

function objectShape(schema: ZodLike): Record<string, ZodLike> | undefined {
  return (schema as { shape?: Record<string, ZodLike> }).shape ?? schema.def.shape
}

function peelPresenceWrapper(current: ZodLike): ZodLike | 'optional' | 'nullable' | undefined {
  const type = current.def.type
  if (current.def.innerType && (type === 'optional' || type === 'default' || type === 'prefault')) {
    return type === 'optional' ? 'optional' : current.def.innerType
  }
  if (type === 'nullable' && current.def.innerType) return 'nullable'
  return undefined
}

function fieldPresence(schema: ZodLike): 'required' | 'optional' | 'nullable' | 'nullish' {
  let optional = false
  let nullable = false
  let current = schema
  for (let guard = 0; guard < 16; guard += 1) {
    const peeled = peelPresenceWrapper(current)
    if (peeled === undefined) break
    if (peeled === 'optional') {
      optional = true
      if (!current.def.innerType) break
      current = current.def.innerType
      continue
    }
    if (peeled === 'nullable') {
      nullable = true
      if (!current.def.innerType) break
      current = current.def.innerType
      continue
    }
    current = peeled
  }
  if (optional && nullable) return 'nullish'
  if (optional) return 'optional'
  if (nullable) return 'nullable'
  return 'required'
}

function identityKeyOnObjectFact(
  fact: Extract<SchemaFact, { type: 'object' }>,
  idKey: 'id' | 'entryId',
): 'missing' | 'optional' | 'invalid' | 'ok' {
  const field = fact.fields[idKey]
  if (!field) return 'missing'
  if (field.presence !== 'required') return 'optional'
  return 'ok'
}

function identityKeyOnUnionFact(
  fact: Extract<SchemaFact, { type: 'union' }>,
  idKey: 'id' | 'entryId',
): 'missing' | 'optional' | 'mismatch' | 'ok' {
  const results = fact.branches.map((branch) => {
    if (branch.fact.type !== 'object') return 'missing' as const
    return identityKeyOnObjectFact(branch.fact, idKey)
  })
  if (results.some((r) => r === 'missing')) return 'missing'
  if (results.some((r) => r === 'optional')) return 'optional'
  if (results.some((r) => r === 'invalid')) return 'missing'
  return 'ok'
}

function issuesForIdentityFieldOnZod(
  elementSchema: ZodLike,
  idKey: 'id' | 'entryId',
  path: string,
): string[] {
  const shape = objectShape(unwrapCore(elementSchema))
  const field = shape?.[idKey]
  if (!field) return []
  const issues: string[] = []
  const presence = fieldPresence(field)
  if (presence !== 'required') {
    issues.push(`${path} identity field ${idKey} must be required, got ${presence}`)
  }
  if (!isStringLike(field)) {
    issues.push(`${path} identity field ${idKey} must be a string schema`)
  }
  return issues
}

function issuesForIdentityOnElementFact(
  element: SchemaFact,
  idKey: 'id' | 'entryId',
  path: string,
): string[] {
  if (element.type === 'object') {
    const keyStatus = identityKeyOnObjectFact(element, idKey)
    if (keyStatus === 'missing') return [`${path} element schema has no required ${idKey}`]
    if (keyStatus === 'optional') return [`${path} element schema has optional ${idKey}`]
    return []
  }
  if (element.type === 'union') {
    const keyStatus = identityKeyOnUnionFact(element, idKey)
    if (keyStatus === 'missing')
      return [`${path} union element has no required ${idKey} on every branch`]
    if (keyStatus === 'optional') return [`${path} union element has optional ${idKey} on a branch`]
    if (keyStatus === 'mismatch') return [`${path} union element branches disagree on identity key`]
    return []
  }
  return [`${path} identity collection element must be an object or discriminated union`]
}

/** Validate declared identity policy against the array element fact. */
export function validateIdentityElement(
  element: SchemaFact,
  policy: OverlayIdentityMeta,
  elementSchema: ZodLike | undefined,
  path: string,
): string[] {
  const zodIssues = elementSchema
    ? issuesForIdentityFieldOnZod(elementSchema, policy.idKey, path)
    : []
  return [...zodIssues, ...issuesForIdentityOnElementFact(element, policy.idKey, path)]
}
