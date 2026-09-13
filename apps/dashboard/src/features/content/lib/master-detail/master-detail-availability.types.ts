import { resolveBroadAvailabilityPresentation } from '../campaign-access/broad-availability-summary.lib'

export type MasterDetailAvailabilityPresentation = {
  /** Stable identity for filter/pin — domain id or RHF field id. */
  rowId: string
  isAvailable: boolean
  /** Broad header: "Available" | "Unavailable". */
  statusLabel: 'Available' | 'Unavailable'
}

export function buildMasterDetailAvailabilityPresentation(
  rowId: string,
  isAvailable: boolean,
): MasterDetailAvailabilityPresentation {
  const broad = resolveBroadAvailabilityPresentation(isAvailable)
  return {
    rowId,
    isAvailable,
    statusLabel: broad.statusLabel,
  }
}
