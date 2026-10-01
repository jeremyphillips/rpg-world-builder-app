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
   * `parity` reproduces the pre-split tier and reason order.
   * Omitted uses the split-fact policy when both rows carry `resolved` facts.
   */
  rankingMode?: 'parity' | 'intentional'
}
