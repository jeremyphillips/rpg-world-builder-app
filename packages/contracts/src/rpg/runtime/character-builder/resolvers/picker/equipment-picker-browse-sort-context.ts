import type { ActiveChoiceContext } from '../../recommendation'

/** Context for character-builder equipment picker browse ordering. */
export type EquipmentPickerBrowseSortContext = {
  preferMartialWeaponBrowseOrder: boolean
  /**
   * What the user is resolving. Omitted and `{ kind: 'none' }` are the general
   * Add Equipment drawer: open pools and alternative packages do not lift rows.
   */
  activeChoice?: ActiveChoiceContext
  /**
   * Unsatisfied requirements that should lift matching candidates.
   * Omitted treats every still-unsatisfied candidate requirement as active.
   */
  activeRequirementIds?: ReadonlySet<string>
  /** Gold-purchase lists rank `purchaseAvailability`. Other flows leave that fact unsorted. */
  rankPurchaseAvailability?: boolean
  /** When true, defined proficiency values order comparable rows. Omitted defaults to true. */
  rankCompatibility?: boolean
}
