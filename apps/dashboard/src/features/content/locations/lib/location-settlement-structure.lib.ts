/**
 * Settlement structure helpers — thin re-exports from the shared Location Structure module.
 * Prefer importing from `location-structure.lib` for new code.
 */
export {
  isDirectPlaceAuthoringTypeForSettlement,
  isDistrictAuthoringTypeForSettlement,
  isSettlementDirectPlaceChild,
  isSettlementDistrictChild,
  partitionSettlementChildLocations,
  resolveSettlementStructureChildAuthoringOptions,
} from './location-structure.lib'
