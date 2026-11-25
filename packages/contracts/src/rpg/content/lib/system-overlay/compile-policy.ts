import { collectionDecision, isAtomicPath } from './collection-decisions'
import type { OverlayPolicyNode, OverlayPresence } from './policy'
import { describeOverlaySchema, type SchemaFact, type SchemaField } from './schema-tree'
import type { z } from 'zod'

export type CompiledOverlayPolicy = {
  policy: OverlayPolicyNode
  issues: readonly string[]
}

function issuePath(path: string): string {
  return path || '<root>'
}

function compileArray(
  fact: Extract<SchemaFact, { type: 'array' }>,
  path: string,
  presence: OverlayPresence,
  issues: string[],
): OverlayPolicyNode {
  const decision = collectionDecision(path, fact)
  if (!decision) {
    issues.push(`${issuePath(path)} is an unclassified array`)
    return { kind: 'atomic', presence }
  }
  if (decision.kind === 'value-list') {
    return { kind: 'value-list', ordered: decision.ordered, presence }
  }
  if (fact.idKey !== decision.idKey) {
    issues.push(
      `${issuePath(path)} id key is ${fact.idKey ?? 'missing'}, policy says ${decision.idKey}`,
    )
  }
  return {
    kind: 'identity',
    idKey: decision.idKey,
    missingSeedRow: decision.missingSeedRow,
    order: decision.order,
    presence,
    row: compileFact(fact.element, `${path}[]`, 'required', issues),
  }
}

function compileObject(
  fact: Extract<SchemaFact, { type: 'object' }>,
  path: string,
  presence: OverlayPresence,
  issues: string[],
): OverlayPolicyNode {
  const fields: Record<string, OverlayPolicyNode> = {}
  for (const [key, field] of Object.entries(fact.fields) as [string, SchemaField][]) {
    const childPath = path ? `${path}.${key}` : key
    fields[key] = compileFact(field.fact, childPath, field.presence, issues)
  }
  return { kind: 'deep', fields, presence }
}

function compileUnion(
  fact: Extract<SchemaFact, { type: 'union' }>,
  path: string,
  presence: OverlayPresence,
  issues: string[],
): OverlayPolicyNode {
  return {
    kind: 'union',
    presence,
    branches: fact.branches.map((branch) => ({
      discriminator: branch.discriminator,
      value: branch.value,
      node: compileFact(
        branch.fact,
        `${path}{${branch.discriminator}=${branch.value}}`,
        'required',
        issues,
      ),
    })),
  }
}

function compileFact(
  fact: SchemaFact,
  path: string,
  presence: OverlayPresence,
  issues: string[],
): OverlayPolicyNode {
  if (path && isAtomicPath(path)) return { kind: 'atomic', presence }
  if (collectionDecision(path, fact)?.kind === 'atomic') return { kind: 'atomic', presence }
  if (fact.type === 'scalar') return { kind: 'scalar', presence }
  if (fact.type === 'array') return compileArray(fact, path, presence, issues)
  if (fact.type === 'object') return compileObject(fact, path, presence, issues)
  if (fact.type === 'union') return compileUnion(fact, path, presence, issues)
  issues.push(`${issuePath(path)} is an unsupported ${fact.wrapper}`)
  return { kind: 'atomic', presence }
}

/** Build the overlay policy for one body schema, listing every path that still has no class. */
export function compileOverlayPolicy(schema: z.ZodType): CompiledOverlayPolicy {
  const issues: string[] = []
  const policy = compileFact(describeOverlaySchema(schema), '', 'required', issues)
  return { policy, issues }
}
