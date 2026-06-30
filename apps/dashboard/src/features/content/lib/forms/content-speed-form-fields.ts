import {
  getMassUnitAbbrev,
  getSpeedRateUnitAbbrev,
  MASS_UNIT_IDS,
  MOUNT_CARRYING_CAPACITY_LABEL,
  SPEED_RATE_UNIT_IDS,
  type Mass,
  type MassUnit,
  type SpeedRate,
  type SpeedRateUnit,
  VEHICLE_CARGO_CAPACITY_LABEL,
} from '@rpg/contracts'
import { toOptions, type FieldConfig, type FieldOption, type RowConfig } from '@rpg/ui/form'
import type { NumberInputDigits } from '@rpg/ui'

type GroupField = FieldConfig | RowConfig

const massUnitOptions = toOptions(
  MASS_UNIT_IDS,
  Object.fromEntries(MASS_UNIT_IDS.map((u) => [u, getMassUnitAbbrev(u)])) as Record<
    MassUnit,
    string
  >,
)

const speedRateUnitOptions = toOptions(
  SPEED_RATE_UNIT_IDS,
  Object.fromEntries(SPEED_RATE_UNIT_IDS.map((u) => [u, getSpeedRateUnitAbbrev(u)])) as Record<
    SpeedRateUnit,
    string
  >,
)

/** Shared value + unit inputSelect builder for scalar unit enums (mass, speed rate, …). */
export function scalarUnitInputSelectField<TUnit extends string>(options: {
  name: string
  label: string
  required?: boolean
  defaultUnit: TUnit
  unitOptions: FieldOption[]
  min?: number
  step?: number
  formatGrouped?: boolean
  unitDisabled?: boolean
  valueDigits?: NumberInputDigits
  width?: FieldConfig['width']
}): FieldConfig {
  const {
    name,
    label,
    required,
    defaultUnit,
    unitOptions,
    min = 0,
    step = 1,
    formatGrouped = false,
    unitDisabled = false,
    valueDigits,
    width = 'full',
  } = options

  const base = {
    type: 'inputSelect' as const,
    name,
    label,
    inputType: 'number' as const,
    valueKey: 'value',
    unitKey: 'unit',
    min,
    step,
    width,
    required,
    formatGrouped,
    ...(valueDigits !== undefined ? { valueDigits } : {}),
    defaultValue: { unit: defaultUnit },
  }

  if (unitOptions.length === 1) {
    const singleUnit = unitOptions[0]
    if (!singleUnit) {
      throw new Error(`scalarUnitInputSelectField "${name}" received an empty unitOptions entry`)
    }
    return {
      ...base,
      fixedUnit: singleUnit.label,
      unitValue: singleUnit.value,
    }
  }

  return {
    ...base,
    options: unitOptions,
    unitDisabled,
  }
}

/** Mass amount + unit composite for mount/vehicle carry limits. */
export function massInputSelectField(options: {
  name: string
  label: string
  required?: boolean
  defaultUnit: MassUnit
  valueDigits?: NumberInputDigits
  width?: FieldConfig['width']
}): FieldConfig {
  const { name, label, required, defaultUnit, valueDigits, width = 'full' } = options
  return scalarUnitInputSelectField({
    name,
    label,
    required,
    defaultUnit,
    unitOptions: massUnitOptions,
    step: defaultUnit === 'lb' ? 0.5 : 1,
    formatGrouped: true,
    valueDigits,
    width,
  })
}

/** Speed rate amount + unit composite for mounts and vehicles. */
export function speedInputSelectField(options: {
  name?: string
  label?: string
  required?: boolean
  defaultUnit: SpeedRateUnit
  valueDigits?: NumberInputDigits
  width?: FieldConfig['width']
}): FieldConfig {
  const {
    name = 'speed',
    label = 'Speed',
    required = true,
    defaultUnit,
    valueDigits = 3,
    width = 'full',
  } = options

  return scalarUnitInputSelectField({
    name,
    label,
    required,
    defaultUnit,
    unitOptions: speedRateUnitOptions,
    step: 0.5,
    valueDigits,
    width,
  })
}

/** Carrying capacity and speed side-by-side at intrinsic width in the Mount group. */
export function mountCapacitySpeedFields(): GroupField[] {
  return [
    {
      kind: 'row',
      fields: [
        massInputSelectField({
          name: 'carryingCapacity',
          label: MOUNT_CARRYING_CAPACITY_LABEL,
          required: true,
          defaultUnit: 'lb',
          valueDigits: 3,
          width: 'auto',
        }),
        speedInputSelectField({
          defaultUnit: 'ft',
          required: true,
          valueDigits: 3,
          width: 'auto',
        }),
      ],
    },
  ]
}

/** Cargo, speed, crew, and passengers in one compact grid row for the Vehicle group. */
export function vehicleCargoSpeedFields(): GroupField[] {
  return [
    {
      kind: 'row',
      layout: 'responsive-4',
      className: 'w-fit max-w-full md:grid-cols-[auto_auto_auto_auto]',
      fields: [
        massInputSelectField({
          name: 'cargoCapacity',
          label: VEHICLE_CARGO_CAPACITY_LABEL,
          defaultUnit: 'ton',
          valueDigits: 3,
          width: 'auto',
        }),
        speedInputSelectField({
          defaultUnit: 'mph',
          required: true,
          valueDigits: 3,
          width: 'auto',
        }),
        {
          type: 'number',
          name: 'crew',
          label: 'Crew',
          min: 0,
          digits: 2,
          width: 'auto',
        },
        {
          type: 'number',
          name: 'passengers',
          label: 'Passengers',
          min: 0,
          digits: 2,
          width: 'auto',
        },
      ],
    },
  ]
}

export function massFromForm(
  mass: { value?: number; unit?: MassUnit } | undefined,
): Mass | undefined {
  const value = mass?.value
  const unit = mass?.unit
  if (value === undefined || Number.isNaN(value) || !unit) return undefined
  return { value, unit }
}

export function massToForm(mass: Mass | undefined): Mass | undefined {
  return mass ? { value: mass.value, unit: mass.unit } : undefined
}

export function massToFormDefaults(unit: MassUnit): { unit: MassUnit } {
  return { unit }
}

export function speedRateFromForm(
  speed: { value?: number; unit?: SpeedRateUnit } | undefined,
): SpeedRate | undefined {
  const value = speed?.value
  const unit = speed?.unit
  if (value === undefined || Number.isNaN(value) || !unit) return undefined
  return { value, unit }
}

export function speedRateToForm(speed: SpeedRate | undefined): SpeedRate | undefined {
  return speed ? { value: speed.value, unit: speed.unit } : undefined
}

export function speedRateToFormDefaults(unit: SpeedRateUnit): { unit: SpeedRateUnit } {
  return { unit }
}

export { MOUNT_CARRYING_CAPACITY_LABEL, VEHICLE_CARGO_CAPACITY_LABEL, type FieldOption }
