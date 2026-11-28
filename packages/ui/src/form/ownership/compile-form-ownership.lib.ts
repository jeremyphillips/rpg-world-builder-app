import { buildFieldRegistry } from '../config/field-registry.lib'
import type { RegistryEntry } from '../config/field-error-map-register.lib'
import type { FormItem } from '../field-config'

export type CompiledFormOwnership = {
  registry: Map<string, RegistryEntry>
  paths: Set<string>
}

/** Builds the field binding index from authoritative form definitions. */
export function compileFormOwnership(
  items: readonly FormItem[],
  formValues?: Record<string, unknown>,
): CompiledFormOwnership {
  const registry = buildFieldRegistry(items, formValues)
  return {
    registry,
    paths: new Set(registry.keys()),
  }
}
