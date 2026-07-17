import type { SubclassFormValues } from './subclass-form-fields'

/** JSON-safe snapshot of subclass form values for edit diffing. */
export function serializeSubclassFormValues(values: SubclassFormValues): string {
  return JSON.stringify({
    name: values.name ?? '',
    slug: values.slug,
    tagline: values.tagline ?? '',
    description: values.description ?? '',
    features: values.features ?? [],
  })
}

export function isSubclassFormValuesLike(value: unknown): value is SubclassFormValues {
  if (typeof value !== 'object' || value === null) return false

  const candidate = value as SubclassFormValues
  return typeof candidate.name === 'string' && Array.isArray(candidate.features)
}
