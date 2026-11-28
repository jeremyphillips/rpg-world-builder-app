import type { CollectionDelta } from './intent'
import type { OverlayPolicyNode, OverlayUnionBranch } from './policy'
import type { StoredCollection } from './stored'

export type OverlayPolicyPath = string

function walkPaths(
  node: OverlayPolicyNode,
  path: string,
  visit: (path: string, node: OverlayPolicyNode) => void,
): void {
  visit(path, node)
  if (node.kind === 'deep') {
    for (const [key, child] of Object.entries(node.fields)) {
      const childPath = path ? `${path}.${key}` : key
      walkPaths(child, childPath, visit)
    }
    return
  }
  if (node.kind === 'identity') {
    walkPaths(node.row, `${path}[]`, visit)
    return
  }
  if (node.kind === 'union') {
    for (const branch of node.branches) {
      walkPaths(branch.node, `${path}{${branch.discriminator}=${branch.value}}`, visit)
    }
  }
}

/** Paths where seed-row removal is rejected (`missingSeedRow: restore`). */
export function restoreCollectionPaths(policy: OverlayPolicyNode): readonly OverlayPolicyPath[] {
  const paths: string[] = []
  walkPaths(policy, '', (path, node) => {
    if (node.kind === 'identity' && node.missingSeedRow === 'restore') {
      paths.push(path || '<root>')
    }
  })
  return paths
}

function nodeAtPath(
  policy: OverlayPolicyNode,
  collectionPath: string,
): OverlayPolicyNode | undefined {
  if (!collectionPath || collectionPath === '<root>') return policy
  const segments = collectionPath.split('.').filter(Boolean)
  let current: OverlayPolicyNode = policy
  for (const segment of segments) {
    if (current.kind !== 'deep') return undefined
    const next = current.fields[segment]
    if (!next) return undefined
    current = next
  }
  return current
}

/** Identity-style collection intent on a value-list policy path is invalid. */
export function valueListCollectionIntentIsUnsupported(delta: CollectionDelta): boolean {
  return (
    (delta.overrides?.length ?? 0) > 0 ||
    (delta.additions?.length ?? 0) > 0 ||
    (delta.removedIds?.length ?? 0) > 0 ||
    (delta.restoreIds?.length ?? 0) > 0 ||
    (delta.order?.length ?? 0) > 0 ||
    delta.restoreOrder === true
  )
}

export function assertIntentCollectionMatchesPolicy(
  policy: OverlayPolicyNode,
  collectionPath: string,
  delta: CollectionDelta,
): string | undefined {
  const node = nodeAtPath(policy, collectionPath)
  if (!node) return `Unknown collection path ${collectionPath}`
  if (node.kind === 'identity') {
    if (delta.reset === undefined && Object.keys(delta).length === 0) {
      return undefined
    }
    return undefined
  }
  if (node.kind === 'value-list') {
    if (valueListCollectionIntentIsUnsupported(delta)) {
      return `Value-list collection at ${collectionPath} only supports reset intent; edit the list via scalar set`
    }
    return undefined
  }
  return `Path ${collectionPath} is not an editable collection`
}

export function assertStoredCollectionMatchesPolicy(
  policy: OverlayPolicyNode,
  collectionPath: string,
  stored: StoredCollection,
): string | undefined {
  const node = nodeAtPath(policy, collectionPath)
  if (!node) return `Unknown collection path ${collectionPath}`
  if (node.kind === 'identity' && stored.kind === 'identity') return undefined
  if (node.kind === 'value-list' && stored.kind === 'value-list') return undefined
  if (stored.kind === 'legacy-array') {
    return 'Legacy-array collections are not supported in this environment'
  }
  return `Stored collection kind ${stored.kind} does not match policy ${node.kind} at ${collectionPath}`
}

export function unionBranchesForNode(node: OverlayPolicyNode): readonly OverlayUnionBranch[] {
  return node.kind === 'union' ? node.branches : []
}
