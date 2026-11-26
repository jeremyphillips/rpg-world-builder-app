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

function walkRestoreSeedIds(
  node: OverlayPolicyNode,
  walkerPath: string,
  seedValue: unknown,
  into: Record<string, readonly string[]>,
): void {
  if (node.kind === 'identity' && node.missingSeedRow === 'restore') {
    const formPath = overlayPathToFormFieldPath(walkerPath)
    if (!formPath) return
    into[formPath] = seedIdentityIds(asArray(seedValue), node.idKey)
    return
  }

  if (node.kind === 'deep') {
    const record = asRecord(seedValue) ?? {}
    for (const [key, child] of Object.entries(node.fields)) {
      const childWalkerPath = walkerPath ? `${walkerPath}.${key}` : key
      walkRestoreSeedIds(child, childWalkerPath, record[key], into)
    }
    return
  }

  if (node.kind === 'union') {
    for (const branch of node.branches) {
      walkRestoreSeedIds(
        branch.node,
        `${walkerPath}{${branch.discriminator}=${branch.value}}`,
        seedValue,
        into,
      )
    }
  }
}

/**
 * Catalog seed ids for editor delete-locks. Only `missingSeedRow: restore` collections
 * are included. Homebrew ids are never present.
 */
export function buildSeedRowIdsByPath(
  catalogSeed: Record<string, unknown>,
  policy: OverlayPolicyNode,
): Readonly<Record<string, readonly string[]>> {
  const into: Record<string, readonly string[]> = {}
  walkRestoreSeedIds(policy, '', catalogSeed, into)
  return into
}
