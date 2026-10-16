import type { WeaponCategory } from '../../../../vocab/weapon/category'
import type { ActiveChoiceContext } from '../../recommendation'

/** Context for character-builder equipment picker browse ordering. */
export type EquipmentPickerBrowseSortContext = {
  preferMartialWeaponBrowseOrder: boolean
  /**
   * Weapon categories the creature is proficient with.
   * When set, those weapons sort ahead of other weapons after strength and kind tie.
   * A specific weapon grant does not belong in this set.
   */
  proficientWeaponCategories?: readonly WeaponCategory[]
  /**
   * What the user is resolving. A `requirement` choice limits which requirement
   * ids lift rows. Pool, package, and allowance choices do not reorder rows.
   */
  activeChoice?: ActiveChoiceContext
  /**
   * Requirement ids that lift matching options. Omitted treats every requirement
   * the row satisfies as active. Role does not matter.
   */
  activeRequirementIds?: ReadonlySet<string>
  /** Gold-purchase lists rank rows that are not for sale. Remaining budget does not reorder. */
  rankPurchaseAvailability?: boolean
  /** When true, defined proficiency values order comparable rows. Omitted defaults to true. */
  rankCompatibility?: boolean
}
