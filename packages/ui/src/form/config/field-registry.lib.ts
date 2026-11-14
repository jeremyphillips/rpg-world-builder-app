import type { FormItem } from '../field-config'
import type { RegistryEntry } from './field-error-map-register.lib'
import { registerFormItems } from './field-error-map-register-items.lib'

export type RegistryLookupMode = 'exact' | 'owner' | 'prefix'

export type RegistryLookup = {
  /** Registry key that matched. Numeric segments stay concrete when that key exists. */
  path: string
  entry: RegistryEntry
}

/** Field lookup keyed by dot path. Concrete array indexes and `*` keys both resolve. */
export function buildFieldRegistry(
  items: FormItem[],
  formValues?: Record<string, unknown>,
): Map<string, RegistryEntry> {
  const registry = new Map<string, RegistryEntry>()
  registerFormItems(registry, '', items, formValues)
  return registry
}

/** Registered dot-path keys for a form field tree. */
export function collectRegisteredPaths(items: FormItem[]): Set<string> {
  return new Set(buildFieldRegistry(items).keys())
}

/**
 * Resolves a registry entry.
 * `exact` matches only the full path. `owner` walks ancestors and skips
 * `exactPath` entries that do not cover the full path. `prefix` walks
 * ancestors and keeps those entries, so schema coverage still treats a
 * container registration as covering nested paths.
 * Each numeric segment tries the concrete key before `*`. A query segment
 * that is already `*` also matches a concrete index in the registry.
 */
export function lookupRegistryEntry(
  registry: Map<string, RegistryEntry>,
  path: string,
  options: { mode: RegistryLookupMode },
): RegistryLookup | undefined {
  const segments = path.split('.').filter((segment) => segment.length > 0)
  if (segments.length === 0) return undefined

  if (options.mode === 'exact') return lookupExact(registry, segments)

  for (let length = segments.length; length > 0; length -= 1) {
    const match = lookupExact(registry, segments.slice(0, length))
    if (!match) continue
    if (options.mode === 'owner' && match.entry.exactPath && length !== segments.length) continue
    return match
  }

  return undefined
}

/** First claimable control or slot under `path`, in registration order. */
export function lookupDescendantRegistryEntry(
  registry: Map<string, RegistryEntry>,
  path: string,
): RegistryLookup | undefined {
  const prefix = `${path}.`
  for (const [key, entry] of registry) {
    if (!key.startsWith(prefix)) continue
    if (entry.labelOnly || entry.role === 'hostSlot' || entry.role === 'array') continue
    if (entry.role !== 'control' && entry.role !== 'slotOwner') continue
    return { path: key, entry }
  }
  return undefined
}

function lookupExact(
  registry: Map<string, RegistryEntry>,
  segments: readonly string[],
): RegistryLookup | undefined {
  const numericIndexes = segments.flatMap((segment, index) =>
    /^\d+$/.test(segment) ? [index] : [],
  )
  const masks = 1 << numericIndexes.length

  for (let mask = 0; mask < masks; mask += 1) {
    const key = segments
      .map((segment, index) => {
        const numericPos = numericIndexes.indexOf(index)
        if (numericPos < 0) return segment
        const bit = numericIndexes.length - 1 - numericPos
        return (mask & (1 << bit)) === 0 ? segment : '*'
      })
      .join('.')
    const entry = registry.get(key)
    if (entry) return { path: key, entry }
  }

  if (segments.some((segment) => segment === '*')) {
    for (const [key, entry] of registry) {
      const keySegments = key.split('.')
      if (keySegments.length !== segments.length) continue
      const matched = keySegments.every((keySegment, index) => {
        const segment = segments[index]
        if (segment === keySegment) return true
        if (segment === '*' && (/^\d+$/.test(keySegment) || keySegment === '*')) return true
        if (keySegment === '*' && (/^\d+$/.test(segment ?? '') || segment === '*')) return true
        return false
      })
      if (matched) return { path: key, entry }
    }
  }

  return undefined
}
