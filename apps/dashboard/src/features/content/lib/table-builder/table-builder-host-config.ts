import type { TableBuilderKind } from './table-builder-kind'

/** Modal lifecycle — kind may change only while creating a new table. */
export type TableBuilderMode = 'create' | 'edit'

/**
 * Host-owned table builder policy: which kinds are valid and which is recommended.
 * Whether kind can still change is owned by {@link TableBuilderMode}, not parent content status.
 */
export type TableBuilderHostConfig = {
  /** Non-empty — at least one kind must be allowed. */
  allowedKinds: readonly [TableBuilderKind, ...TableBuilderKind[]]
  /** Must be absent or a member of `allowedKinds`. */
  recommendedKind?: TableBuilderKind
  /** Semantic level set for the structural axis — progression tables only. */
  allowedLevels?: readonly number[]
}

export function resolveTableBuilderRecommendedKind(
  config: TableBuilderHostConfig,
): TableBuilderKind {
  return config.recommendedKind ?? config.allowedKinds[0]
}

export function assertTableBuilderHostConfig(config: TableBuilderHostConfig): void {
  if (config.allowedKinds.length === 0) {
    throw new Error('TableBuilderHostConfig.allowedKinds must be non-empty')
  }
  if (
    config.recommendedKind !== undefined &&
    !config.allowedKinds.includes(config.recommendedKind)
  ) {
    throw new Error(
      `TableBuilderHostConfig.recommendedKind "${config.recommendedKind}" is not in allowedKinds`,
    )
  }
}
