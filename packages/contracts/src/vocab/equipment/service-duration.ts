import { z } from 'zod'

// ---------------------------------------------------------------------------
// Service duration units — billing cadence for priced services (SRD v1).
// ---------------------------------------------------------------------------

export const SERVICE_DURATION_UNITS = ['day', 'mile'] as const

export const serviceDurationUnitSchema = z.enum(SERVICE_DURATION_UNITS)

export type ServiceDurationUnit = z.infer<typeof serviceDurationUnitSchema>

export const SERVICE_DURATION_UNIT_ENTRIES = {
  day: { label: 'Day', abbrev: 'day' },
  mile: { label: 'Mile', abbrev: 'mile' },
} as const satisfies Record<ServiceDurationUnit, { label: string; abbrev: string }>

export const serviceDurationSchema = z.object({
  value: z.number().int().positive(),
  unit: serviceDurationUnitSchema,
})

export type ServiceDuration = z.infer<typeof serviceDurationSchema>

export function getServiceDurationUnitLabel(unit: string): string {
  return SERVICE_DURATION_UNIT_ENTRIES[unit as ServiceDurationUnit]?.label ?? unit
}

/** Display cadence for tables and detail views (e.g. `per day`, `2 per mile`). */
export function formatServiceDuration(duration: ServiceDuration): string {
  if (duration.value === 1) {
    return duration.unit === 'day' ? 'per day' : 'per mile'
  }
  return `${duration.value} per ${duration.unit}`
}
