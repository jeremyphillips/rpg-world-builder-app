import type { z } from 'zod'

/** Structural fact used to check an overlay policy against a body schema. */
export type SchemaFact =
  | { type: 'scalar' }
  | { type: 'unsupported'; wrapper: string }
  | {
      type: 'object'
      fields: Readonly<Record<string, SchemaField>>
    }
  | { type: 'array'; element: SchemaFact; idKey?: 'id' | 'entryId' }
  | { type: 'union'; branches: readonly SchemaUnionBranch[] }

export type SchemaField = {
  presence: SchemaPresence
  fact: SchemaFact
}

export type SchemaPresence = 'required' | 'optional' | 'nullable' | 'nullish'

export type SchemaUnionBranch = {
  discriminator: string
  value: string
  fact: SchemaFact
}

type ZodLike = {
  def: {
    type: string
    innerType?: ZodLike
    in?: ZodLike
    out?: ZodLike
    schema?: ZodLike
    shape?: Record<string, ZodLike>
    options?: readonly ZodLike[]
    element?: ZodLike
    left?: ZodLike
    right?: ZodLike
    discriminator?: string
    values?: ReadonlySet<unknown> | readonly unknown[]
    catchall?: ZodLike
  }
  shape?: Record<string, ZodLike>
}

const ID_KEYS = ['id', 'entryId'] as const

function asZod(schema: z.ZodType): ZodLike {
  return schema as unknown as ZodLike
}

function branchValue(schema: ZodLike): string | undefined {
  const type = schema.def.type
  const values = schema.def.values
  const list = values instanceof Set ? [...values] : Array.isArray(values) ? [...values] : []
  if (type === 'enum') return '*'
  if (list.length !== 1 || typeof list[0] !== 'string') return undefined
  return list[0]
}

function nextWrapper(
  current: ZodLike,
): { next: ZodLike; optional: boolean; nullable: boolean } | undefined {
  const type = current.def.type
  if (current.def.innerType && (type === 'optional' || type === 'default' || type === 'prefault')) {
    return { next: current.def.innerType, optional: type === 'optional', nullable: false }
  }
  if (type === 'nullable' && current.def.innerType) {
    return { next: current.def.innerType, optional: false, nullable: true }
  }
  if (type === 'pipe' && current.def.out) {
    return { next: current.def.out, optional: false, nullable: false }
  }
  if (type === 'transform' && current.def.schema) {
    return { next: current.def.schema, optional: false, nullable: false }
  }
  return undefined
}

function presenceFor(optional: boolean, nullable: boolean): SchemaPresence {
  if (optional && nullable) return 'nullish'
  if (optional) return 'optional'
  if (nullable) return 'nullable'
  return 'required'
}

function unwrap(schema: ZodLike): { presence: SchemaPresence; core: ZodLike } {
  let optional = false
  let nullable = false
  let current = schema
  for (let guard = 0; guard < 12; guard += 1) {
    const peeled = nextWrapper(current)
    if (!peeled) break
    optional = optional || peeled.optional
    nullable = nullable || peeled.nullable
    current = peeled.next
  }
  return { presence: presenceFor(optional, nullable), core: current }
}

function objectShape(schema: ZodLike): Record<string, ZodLike> | undefined {
  return schema.shape ?? schema.def.shape
}

function requiredIdKey(schema: ZodLike): 'id' | 'entryId' | undefined {
  const shape = objectShape(schema)
  if (!shape) return undefined
  for (const key of ID_KEYS) {
    const field = shape[key]
    if (!field) continue
    if (unwrap(field).presence === 'required') return key
  }
  return undefined
}

function idKeyForFact(schema: ZodLike, fact: SchemaFact): 'id' | 'entryId' | undefined {
  if (fact.type === 'object') return requiredIdKey(schema)
  if (fact.type !== 'union') return undefined
  const keys = fact.branches.map((branch) => {
    if (branch.fact.type !== 'object') return undefined
    const field = branch.fact.fields.id ?? branch.fact.fields.entryId
    if (!field || field.presence !== 'required') return undefined
    return branch.fact.fields.entryId?.presence === 'required' ? 'entryId' : 'id'
  })
  if (keys.some((key) => key === undefined)) return undefined
  return keys.every((key) => key === 'entryId') ? 'entryId' : 'id'
}

function branchesFromOption(core: ZodLike): SchemaUnionBranch[] | undefined {
  if (core.def.type === 'union') return unionBranches(core)
  const shape = objectShape(core)
  if (!shape) return undefined
  const discriminatorField = ['kind', 'preset', 'operation', 'model', 'source', 'valueType'].find(
    (key) => shape[key],
  )
  if (!discriminatorField) return undefined
  const discriminatorSchema = shape[discriminatorField]
  if (!discriminatorSchema) return undefined
  const literal = branchValue(unwrap(discriminatorSchema).core)
  if (!literal) return undefined
  return [{ discriminator: discriminatorField, value: literal, fact: describeCore(core) }]
}

function mergeFacts(left: SchemaFact, right: SchemaFact): SchemaFact {
  if (left.type === 'union' && right.type === 'object') {
    return {
      type: 'union',
      branches: left.branches.map((branch) => ({
        ...branch,
        fact: mergeFacts(branch.fact, right),
      })),
    }
  }
  if (right.type === 'union' && left.type === 'object') return mergeFacts(right, left)
  if (left.type === 'object' && right.type === 'object') {
    return { type: 'object', fields: { ...left.fields, ...right.fields } }
  }
  return { type: 'unsupported', wrapper: 'intersection' }
}

function collectOptionBranches(options: readonly ZodLike[]): SchemaUnionBranch[] | undefined {
  const branches: SchemaUnionBranch[] = []
  for (const option of options) {
    const nested = branchesFromOption(unwrap(option).core)
    if (!nested) return undefined
    branches.push(...nested)
  }
  return branches
}

function plainUnionBranch(core: ZodLike): SchemaUnionBranch | undefined {
  const shape = objectShape(core)
  const discriminatorField = shape ? ['kind', 'preset'].find((key) => shape[key]) : undefined
  const discriminatorSchema = discriminatorField ? shape?.[discriminatorField] : undefined
  if (!discriminatorField || !discriminatorSchema) return undefined
  const literal = branchValue(unwrap(discriminatorSchema).core)
  if (!literal) return undefined
  return { discriminator: discriminatorField, value: literal, fact: describeCore(core) }
}

function unionBranches(schema: ZodLike): SchemaUnionBranch[] | undefined {
  const options = schema.def.options
  if (!options?.length) return undefined
  if (schema.def.discriminator) return collectOptionBranches(options)
  const branches: SchemaUnionBranch[] = []
  for (const option of options) {
    const core = unwrap(option).core
    if (core.def.type === 'union' && core.def.options) {
      const nested = unionBranches(core)
      if (!nested) return undefined
      branches.push(...nested)
      continue
    }
    const branch = plainUnionBranch(core)
    if (!branch) return undefined
    branches.push(branch)
  }
  return branches
}

const SCALAR_TYPES = new Set([
  'string',
  'number',
  'boolean',
  'enum',
  'literal',
  'unknown',
  'any',
  'date',
  'bigint',
  'nan',
  'int',
])

const OPAQUE_TYPES = new Set(['lazy', 'tuple', 'record', 'map'])

function describeIntersection(schema: ZodLike): SchemaFact | undefined {
  if (schema.def.type !== 'intersection' || !schema.def.left || !schema.def.right) return undefined
  return mergeFacts(
    describeCore(unwrap(schema.def.left).core),
    describeCore(unwrap(schema.def.right).core),
  )
}

function describeObject(schema: ZodLike): SchemaFact | undefined {
  const shape = schema.def.type === 'object' ? objectShape(schema) : undefined
  if (!shape) return undefined
  if (schema.def.catchall && schema.def.catchall.def.type !== 'never') {
    return { type: 'unsupported', wrapper: 'catchall' }
  }
  const fields: Record<string, SchemaField> = {}
  for (const [key, field] of Object.entries(shape)) {
    const unwrapped = unwrap(field)
    fields[key] = { presence: unwrapped.presence, fact: describeCore(unwrapped.core) }
  }
  return { type: 'object', fields }
}

function describeArray(schema: ZodLike): SchemaFact | undefined {
  if (schema.def.type !== 'array' || !schema.def.element) return undefined
  const element = unwrap(schema.def.element).core
  const elementFact = describeCore(element)
  const idKey = idKeyForFact(element, elementFact)
  return { type: 'array', element: elementFact, ...(idKey ? { idKey } : {}) }
}

function describeUnion(schema: ZodLike): SchemaFact | undefined {
  if (schema.def.type !== 'union') return undefined
  const branches = unionBranches(schema)
  if (!branches) return { type: 'unsupported', wrapper: 'union' }
  return { type: 'union', branches }
}

function describeCore(schema: ZodLike): SchemaFact {
  const type = schema.def.type
  return (
    describeIntersection(schema) ??
    (OPAQUE_TYPES.has(type) ? { type: 'unsupported', wrapper: type } : undefined) ??
    describeUnion(schema) ??
    describeObject(schema) ??
    describeArray(schema) ??
    (SCALAR_TYPES.has(type) ? { type: 'scalar' } : { type: 'unsupported', wrapper: type })
  )
}

/** Describe a Zod body schema as the tree an overlay policy must cover. */
export function describeOverlaySchema(schema: z.ZodType): SchemaFact {
  return describeCore(unwrap(asZod(schema)).core)
}

export type CollectionPath = {
  path: string
  shape: 'array' | 'unsupported'
  idKey?: 'id' | 'entryId'
  detail?: string
}

function walkCollections(fact: SchemaFact, path: string, out: CollectionPath[]): void {
  if (fact.type === 'unsupported') {
    out.push({ path: path || '<root>', shape: 'unsupported', detail: fact.wrapper })
    return
  }
  if (fact.type === 'array') {
    out.push({
      path: path || '<root>',
      shape: 'array',
      ...(fact.idKey ? { idKey: fact.idKey } : {}),
    })
    walkCollections(fact.element, `${path}[]`, out)
    return
  }
  if (fact.type === 'object') {
    for (const [key, field] of Object.entries(fact.fields)) {
      walkCollections(field.fact, path ? `${path}.${key}` : key, out)
    }
    return
  }
  if (fact.type === 'union') {
    for (const branch of fact.branches) {
      walkCollections(branch.fact, `${path}{${branch.discriminator}=${branch.value}}`, out)
    }
  }
}

/** Array and unsupported nodes, for policy authoring and coverage failures. */
export function collectSchemaCollections(schema: z.ZodType): CollectionPath[] {
  const found: CollectionPath[] = []
  walkCollections(describeOverlaySchema(schema), '', found)
  return found
}
