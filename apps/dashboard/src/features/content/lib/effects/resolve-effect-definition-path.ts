/** Library path for an effect id, resolved at read time so editors are not bound to an index. */
export function resolveEffectDefinitionPath(
  libraryPath: string,
  library: unknown,
  effectId: string | undefined,
): string | undefined {
  if (!effectId || !Array.isArray(library)) return undefined
  const index = library.findIndex(
    (entry) =>
      entry &&
      typeof entry === 'object' &&
      'id' in entry &&
      (entry as { id?: unknown }).id === effectId,
  )
  if (index < 0) return undefined
  return `${libraryPath}.${index}`
}
