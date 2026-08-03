import { z } from 'zod'
import type { Location } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

export const PRIMARY_WORLD_NONE_VALUE = '__none__' as const

export const worldSettingsSchema = z.object({
  primaryWorldId: z.string().optional(),
})

export type WorldSettingsValues = z.infer<typeof worldSettingsSchema>

export function buildWorldSettingsFields(locations: readonly Location[] | undefined): FormItem[] {
  const worldOptions = [...(locations ?? [])]
    .filter((location) => location.kind === 'world')
    .map((location) => ({ value: location.id, label: location.name }))
    .sort((left, right) => left.label.localeCompare(right.label))

  return [
    {
      type: 'select',
      name: 'primaryWorldId',
      label: 'Primary world',
      hint: 'Optional default parent when authoring locations. Multiple worlds remain allowed.',
      placeholder: 'None',
      options: [{ value: PRIMARY_WORLD_NONE_VALUE, label: 'None' }, ...worldOptions],
    },
  ]
}

export function primaryWorldIdFromSettingsValue(
  value: string | undefined,
): string | null | undefined {
  if (value === undefined) return undefined
  return value.length > 0 && value !== PRIMARY_WORLD_NONE_VALUE ? value : null
}

export function primaryWorldIdToSettingsValue(primaryWorldId: string | undefined): string {
  return primaryWorldId ?? PRIMARY_WORLD_NONE_VALUE
}
