import { availableBodyRows, isBodyRowAvailable } from './lib/campaign-access/body-row-availability'

/** Whether a starting-equipment package is available in the campaign (omitted or true = available). */
export const isStartingEquipmentOptionAvailable = isBodyRowAvailable

/** Filters starting-equipment packages to those available in the campaign. */
export const availableStartingEquipmentOptions = availableBodyRows
