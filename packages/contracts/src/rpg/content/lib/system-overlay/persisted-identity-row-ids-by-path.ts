import type { OverlayPolicyNode } from './policy'
import { overlayPathToFormFieldPath } from './overlay-form-path'
import { seedIdentityIds } from './order'

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

function asArray(value: unknown): readonly unknown[] {
  return Array.isArray(value) ? value : []
}

function policyForUnionRow(
  row: Record<string, unknown>,
  policy: Extract<OverlayPolicyNode, { kind: 'union' }>,
): OverlayPolicyNode | undefined {
  for (const branch of policy.branches) {
    if (row[branch.discriminator] === branch.value) return branch.node
  }
  return undefined
}

function walkPersistedIdentityRowIds(
  node: OverlayPolicyNode,
  walkerPath: string,
  entityValue: unknown,
  into: Record<string, readonly string[]>,
): void {
  if (node.kind === 'identity') {
    const formPath = overlayPathToFormFieldPath(walkerPath)
    if (!formPath) return
    into[formPath] = seedIdentityIds(asArray(entityValue), node.idKey)
    return
  }

  if (node.kind === 'deep') {
    const record = asRecord(entityValue) ?? {}
    for (const [key, child] of Object.entries(node.fields)) {
      const childWalkerPath = walkerPath ? `${walkerPath}.${key}` : key
      walkPersistedIdentityRowIds(child, childWalkerPath, record[key], into)
    }
    return
  }

  if (node.kind === 'union') {
    const record = asRecord(entityValue)
    if (!record) return
    const branchPolicy = policyForUnionRow(record, node)
    if (!branchPolicy) return
    for (const branch of node.branches) {
      if (record[branch.discriminator] === branch.value) {
        const childWalkerPath = walkerPath
          ? `${walkerPath}{${branch.discriminator}=${branch.value}}`
          : `{${branch.discriminator}=${branch.value}}`
        walkPersistedIdentityRowIds(branchPolicy, childWalkerPath, entityValue, into)
        return
      }
    }
  }
}

/**
 * Row ids on the loaded effective entity, keyed by master-detail field path.
 * Includes every identity collection (restore and delete policies).
 */
export function buildPersistedIdentityRowIdsByPath(
  effectiveEntity: Record<string, unknown>,
  policy: OverlayPolicyNode,
): Readonly<Record<string, readonly string[]>> {
  const into: Record<string, readonly string[]> = {}
  walkPersistedIdentityRowIds(policy, '', effectiveEntity, into)
  return into
}
