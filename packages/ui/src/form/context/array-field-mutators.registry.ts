import type { Control } from 'react-hook-form'

export type ArrayFieldMutators = {
  getValues: () => unknown[]
  remove: (index: number) => void
}

const registry = new WeakMap<Control, Map<string, ArrayFieldMutators>>()

/** Registers RHF field-array mutators for a resolved array path (e.g. `resolution.effects`). */
export function registerArrayFieldMutators(
  control: Control,
  fullName: string,
  mutators: ArrayFieldMutators,
): () => void {
  let paths = registry.get(control)
  if (!paths) {
    paths = new Map()
    registry.set(control, paths)
  }

  paths.set(fullName, mutators)

  return () => {
    paths?.delete(fullName)
    if (paths?.size === 0) {
      registry.delete(control)
    }
  }
}

export function getArrayFieldMutators(
  control: Control,
  fullName: string,
): ArrayFieldMutators | undefined {
  return registry.get(control)?.get(fullName)
}
