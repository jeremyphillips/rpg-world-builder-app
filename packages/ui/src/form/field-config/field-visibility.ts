import type { FieldOption } from './field-options'

/** Context passed to `presentation.readOnlyWhen` for option-backed fields. */
export type FieldReadOnlyContext = {
  options: FieldOption[]
}

/** Presentation overrides that swap an editable control for read-only chrome. */
export type FieldPresentationConfig = {
  readOnlyWhen?: (context: FieldReadOnlyContext) => boolean
  /**
   * When present, a committed option label renders read-only with a Change
   * action that reveals the select without unregistering the field. See
   * `packages/ui/docs/forms/field-types.md` (Select change presentation).
   */
  change?: { label: string }
}
export interface FieldVisibility {
  /** Field names whose values `visibleWhen` reads. */
  dependsOn: string[]
  /** Given the watched values, return whether this field should render. */
  visibleWhen: (watched: Record<string, unknown>) => boolean
}

/**
 * Disables the control while keeping it mounted and registered. Does not affect
 * resolver hidden-field omission — use `visibility` only when values should unregister.
 */
export type FieldInteractivity = {
  dependsOn: readonly string[]
  disabledWhen: (values: Record<string, unknown>) => boolean
}

/** Merges two visibility predicates with OR semantics and a deduped `dependsOn` list. */
export function combineFieldVisibility(a: FieldVisibility, b: FieldVisibility): FieldVisibility {
  return {
    dependsOn: [...new Set([...a.dependsOn, ...b.dependsOn])],
    visibleWhen: (values) => a.visibleWhen(values) || b.visibleWhen(values),
  }
}

/** Merges two visibility predicates with AND semantics and a deduped `dependsOn` list. */
export function combineFieldVisibilityAll(a: FieldVisibility, b: FieldVisibility): FieldVisibility {
  return {
    dependsOn: [...new Set([...a.dependsOn, ...b.dependsOn])],
    visibleWhen: (values) => a.visibleWhen(values) && b.visibleWhen(values),
  }
}

/** True when every declared visibility dependency is present in `knownKeys`. */
export function areVisibilityDependenciesKnown(
  visibility: { dependsOn?: readonly string[] } | null | undefined,
  knownKeys: readonly string[],
): boolean {
  if (!visibility?.dependsOn) return false
  return visibility.dependsOn.every((dep) => knownKeys.includes(dep))
}
