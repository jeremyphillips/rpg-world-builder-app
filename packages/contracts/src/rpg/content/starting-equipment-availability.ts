import type { StartingEquipmentOption } from './starting-equipment'
import { availableBodyRows, isBodyRowAvailable } from './lib/campaign-access/body-row-availability'

/** Whether a starting-equipment package is available in the campaign (omitted or true = available). */
export const isStartingEquipmentOptionAvailable = isBodyRowAvailable

/** Filters starting-equipment packages to those available in the campaign. */
export const availableStartingEquipmentOptions = availableBodyRows

/** Resolves a selected package id among campaign-available options only. */
export function findAvailableStartingEquipmentOption<T extends StartingEquipmentOption>(
  options: readonly T[],
  optionId: string,
): T | undefined {
  return availableStartingEquipmentOptions(options).find((option) => option.id === optionId)
}
