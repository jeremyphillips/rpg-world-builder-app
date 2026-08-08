'use client'

import { Button, Input, Text, cn, fieldArrayItemClasses, fieldLabelVariants } from '@rpg/ui'

import { useSettlementCreateComposition } from './settlement-create-composition-context.client'

export const SETTLEMENT_STARTING_DISTRICTS_ADD_LABEL = 'Add district' as const

const REMOVE_DISTRICT_LABEL = 'Remove'

function removeDistrictAriaLabel(name: string, index: number): string {
  const trimmedName = name.trim()
  if (trimmedName) {
    return `Remove district ${trimmedName}`
  }
  return `Remove district ${index + 1}`
}

/** Interactive starting-district rows for settlement contained create. */
export function LocationSettlementStartingDistrictsSlot() {
  const { composition, addDistrict, updateDistrict, removeDistrict } =
    useSettlementCreateComposition()

  return (
    <div className="space-y-3">
      {composition.districts.length === 0 ? (
        <Text variant="muted" className="text-sm">
          No starting districts yet.
        </Text>
      ) : (
        <ul className="space-y-2">
          {composition.districts.map((district, index) => {
            const inputId = `starting-district-${district.id}`

            return (
              <li key={district.id} className={cn(fieldArrayItemClasses, 'items-end gap-2')}>
                <div className="min-w-0 flex-1 space-y-1">
                  <label htmlFor={inputId} className={fieldLabelVariants()}>
                    District name
                  </label>
                  <Input
                    id={inputId}
                    value={district.name}
                    onChange={(event) => updateDistrict(district.id, event.target.value)}
                    placeholder="Dock Ward"
                    aria-label={`District name ${index + 1}`}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  aria-label={removeDistrictAriaLabel(district.name, index)}
                  onClick={() => removeDistrict(district.id)}
                >
                  {REMOVE_DISTRICT_LABEL}
                </Button>
              </li>
            )
          })}
        </ul>
      )}
      <Button type="button" variant="outline" onClick={addDistrict}>
        {SETTLEMENT_STARTING_DISTRICTS_ADD_LABEL}
      </Button>
    </div>
  )
}
