import type { FormItem } from '../../field-config'
import type { ArrayRowVariantTopology } from '../../field-config/form-item.types'

const DEFAULT_DISCRIMINATOR_KEY = 'kind'

export function readRowDiscriminator(
  row: unknown,
  topology: ArrayRowVariantTopology,
): string | undefined {
  if (typeof row !== 'object' || row === null) return undefined
  const key = topology.discriminatorKey ?? DEFAULT_DISCRIMINATOR_KEY
  const value = (row as Record<string, unknown>)[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export function resolveFieldsForRowVariantTopology(
  topology: ArrayRowVariantTopology,
  row: unknown,
): FormItem[] {
  const shared = topology.shared ? [...topology.shared] : []
  const discriminator = readRowDiscriminator(row, topology)
  const variant =
    (discriminator && topology.variants[discriminator]) ??
    topology.fallback ??
    Object.values(topology.variants)[0]
  return variant ? [...shared, ...variant] : shared
}

export function collectRowVariantTopologyFields(topology: ArrayRowVariantTopology): FormItem[] {
  const merged: FormItem[] = [...(topology.shared ?? [])]
  const seen = new Set<string>()

  for (const fields of Object.values(topology.variants)) {
    for (const field of fields) {
      const key = JSON.stringify(field)
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(field)
    }
  }

  if (topology.fallback) {
    for (const field of topology.fallback) {
      const key = JSON.stringify(field)
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(field)
    }
  }

  return merged
}
