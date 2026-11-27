import type { z } from 'zod'

import {
  isOverlayAtomicMeta,
  isOverlayCollectionMeta,
  type OverlayCollectionMeta,
} from './annotate'
import { validateIdentityElement } from './identity-validation'
import { overlayPathOverrides } from './path-overrides'
import type { OverlayPolicyNode, OverlayPresence } from './policy'
import { describeOverlaySchema, type SchemaFact, type SchemaField } from './schema-tree'

export type CompiledOverlayPolicy =
  | { ok: true; policy: OverlayPolicyNode }
  | { ok: false; issues: readonly string[] }

export type OverlayParticipantCompileOptions = {
  participantId?: string
}

function issuePath(path: string): string {
  return path || '<root>'
}

function hasAnnotatedCollectionDescendant(fact: SchemaFact): boolean {
  if (fact.type === 'array') {
    return fact.annotation !== undefined && isOverlayCollectionMeta(fact.annotation)
  }
  if (fact.type === 'object') {
    if (fact.annotation !== undefined && isOverlayAtomicMeta(fact.annotation)) return false
    return Object.values(fact.fields).some((field) => hasAnnotatedCollectionDescendant(field.fact))
  }
  if (fact.type === 'union') {
    return fact.branches.some((branch) => hasAnnotatedCollectionDescendant(branch.fact))
  }
  return false
}

function overrideForPath(
  participantId: string | undefined,
  path: string,
): OverlayCollectionMeta | undefined {
  if (!participantId) return undefined
  const matches = overlayPathOverrides.filter(
    (entry) => entry.participantId === participantId && entry.path === path,
  )
  if (matches.length > 1) return undefined
  if (matches.length === 1) return matches[0]!.collection
  return undefined
}

function resolveCollectionMeta(
  path: string,
  fact: Extract<SchemaFact, { type: 'array' }>,
  participantId: string | undefined,
  issues: string[],
): OverlayCollectionMeta | undefined {
  const override = overrideForPath(participantId, path)
  const declared = fact.annotation
  if (override && declared && isOverlayCollectionMeta(declared)) {
    if (JSON.stringify(override) !== JSON.stringify(declared)) {
      issues.push(`${issuePath(path)} override conflicts with schema annotation`)
    }
  }
  if (override) return override
  if (declared && isOverlayCollectionMeta(declared)) return declared
  return undefined
}

function compileArray(
  fact: Extract<SchemaFact, { type: 'array' }>,
  path: string,
  presence: OverlayPresence,
  issues: string[],
  participantId: string | undefined,
): OverlayPolicyNode | undefined {
  const meta = resolveCollectionMeta(path, fact, participantId, issues)
  if (!meta) {
    issues.push(`${issuePath(path)} is an unannotated array`)
    compileFact(fact.element, `${path}[]`, 'required', issues, participantId)
    return undefined
  }
  if (meta.kind === 'value-list') {
    return { kind: 'value-list', ordered: meta.ordered, presence }
  }
  const elementSchema = fact.elementSchema as unknown as { def: { type: string } } | undefined
  issues.push(
    ...validateIdentityElement(fact.element, meta, elementSchema as never, issuePath(path)),
  )
  const row = compileFact(fact.element, `${path}[]`, 'required', issues, participantId)
  if (!row) return undefined
  return {
    kind: 'identity',
    idKey: meta.idKey,
    missingSeedRow: meta.missingSeedRow,
    order: meta.order,
    presence,
    row,
  }
}

function compileObject(
  fact: Extract<SchemaFact, { type: 'object' }>,
  path: string,
  presence: OverlayPresence,
  issues: string[],
  participantId: string | undefined,
): OverlayPolicyNode | undefined {
  const atomic =
    fact.annotation !== undefined && isOverlayAtomicMeta(fact.annotation)
      ? fact.annotation
      : undefined
  if (atomic) {
    const nestedCollection = Object.values(fact.fields).some((field) =>
      hasAnnotatedCollectionDescendant(field.fact),
    )
    if (nestedCollection) {
      issues.push(
        `${issuePath(path)} is atomic (${atomic.reason}) but contains an annotated collection`,
      )
    }
    return { kind: 'atomic', presence }
  }
  const fields: Record<string, OverlayPolicyNode> = {}
  for (const [key, field] of Object.entries(fact.fields) as [string, SchemaField][]) {
    const childPath = path ? `${path}.${key}` : key
    const child = compileFact(field.fact, childPath, field.presence, issues, participantId)
    if (child) fields[key] = child
  }
  if (Object.keys(fields).length !== Object.keys(fact.fields).length) return undefined
  return { kind: 'deep', fields, presence }
}

function compileUnion(
  fact: Extract<SchemaFact, { type: 'union' }>,
  path: string,
  presence: OverlayPresence,
  issues: string[],
  participantId: string | undefined,
): OverlayPolicyNode | undefined {
  const branches = fact.branches.map((branch) => {
    const branchPath = `${path}{${branch.discriminator}=${branch.value}}`
    const node = compileFact(branch.fact, branchPath, 'required', issues, participantId)
    return node ? { discriminator: branch.discriminator, value: branch.value, node } : undefined
  })
  if (branches.some((branch) => branch === undefined)) return undefined
  return {
    kind: 'union',
    presence,
    branches: branches as NonNullable<(typeof branches)[number]>[],
  }
}

function compileFact(
  fact: SchemaFact,
  path: string,
  presence: OverlayPresence,
  issues: string[],
  participantId: string | undefined,
): OverlayPolicyNode | undefined {
  if (fact.type === 'scalar') return { kind: 'scalar', presence }
  if (fact.type === 'array') return compileArray(fact, path, presence, issues, participantId)
  if (fact.type === 'object') return compileObject(fact, path, presence, issues, participantId)
  if (fact.type === 'union') return compileUnion(fact, path, presence, issues, participantId)
  if (fact.type === 'unsupported') {
    if (fact.annotation && isOverlayAtomicMeta(fact.annotation)) {
      return { kind: 'atomic', presence }
    }
    issues.push(`${issuePath(path)} is unsupported (${fact.wrapper}) without an atomic annotation`)
    return undefined
  }
  return undefined
}

function validateOverrides(
  participantId: string | undefined,
  schema: z.ZodType,
  issues: string[],
): void {
  if (!participantId) return
  const paths = new Set<string>()
  walkPathsForValidation(describeOverlaySchema(schema), '', paths)
  for (const override of overlayPathOverrides) {
    if (override.participantId !== participantId) continue
    if (!paths.has(override.path)) {
      issues.push(`Unknown override path ${override.path} for participant ${participantId}`)
    }
  }
}

function walkPathsForValidation(fact: SchemaFact, path: string, out: Set<string>): void {
  if (fact.type === 'array') {
    out.add(path || '<root>')
    walkPathsForValidation(fact.element, `${path}[]`, out)
    return
  }
  if (fact.type === 'object') {
    for (const [key, field] of Object.entries(fact.fields)) {
      walkPathsForValidation(field.fact, path ? `${path}.${key}` : key, out)
    }
    return
  }
  if (fact.type === 'union') {
    for (const branch of fact.branches) {
      walkPathsForValidation(branch.fact, `${path}{${branch.discriminator}=${branch.value}}`, out)
    }
  }
  if (fact.type === 'unsupported') {
    out.add(path || '<root>')
  }
}

/** Build the overlay policy for one body schema. Usable only when `ok` is true. */
export function compileOverlayPolicy(
  schema: z.ZodType,
  options: OverlayParticipantCompileOptions = {},
): CompiledOverlayPolicy {
  const issues: string[] = []
  validateOverrides(options.participantId, schema, issues)
  const policy = compileFact(
    describeOverlaySchema(schema),
    '',
    'required',
    issues,
    options.participantId,
  )
  if (issues.length > 0 || !policy) {
    return { ok: false, issues }
  }
  return { ok: true, policy }
}

/** Require a successful compile or throw with the issue list. */
export function requireCompiledOverlayPolicy(
  schema: z.ZodType,
  options: OverlayParticipantCompileOptions = {},
): OverlayPolicyNode {
  const compiled = compileOverlayPolicy(schema, options)
  if (!compiled.ok) {
    throw new Error(
      `Overlay policy compile failed:\n${compiled.issues.map((issue) => `- ${issue}`).join('\n')}`,
    )
  }
  return compiled.policy
}
