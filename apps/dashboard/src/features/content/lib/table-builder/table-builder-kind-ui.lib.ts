import type { TableBuilderHostConfig, TableBuilderMode } from './table-builder-host-config'
import { resolveTableBuilderRecommendedKind } from './table-builder-host-config'
import type { TableBuilderKind } from './table-builder-kind'

export type TableKindPresentation =
  | { mode: 'selectable'; kinds: readonly TableBuilderKind[] }
  | { mode: 'metadata'; kind: TableBuilderKind }

/**
 * Central resolver for table kind UI.
 * Create + multiple allowed kinds → selectable cards; otherwise compact read-only metadata.
 */
export function resolveTableKindPresentation(
  config: TableBuilderHostConfig,
  builderMode: TableBuilderMode,
  currentKind: TableBuilderKind,
): TableKindPresentation {
  if (builderMode === 'create' && config.allowedKinds.length > 1) {
    const recommended = resolveTableBuilderRecommendedKind(config)
    const rest = config.allowedKinds.filter((kind) => kind !== recommended)
    return { mode: 'selectable', kinds: [recommended, ...rest] }
  }
  return { mode: 'metadata', kind: currentKind }
}
