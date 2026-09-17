import { dialogPanelScrollRegionClasses } from '@rpg/ui'

/** Inner scroll region — pairs with `Modal.Body stableBody` for a docked footer. */
export const tableBuilderModalScrollRegionClasses = dialogPanelScrollRegionClasses

/** Leading destructive action in the footer row — pushed left of Cancel/Save. */
export const tableBuilderModalDeleteButtonClasses =
  'mr-auto text-destructive hover:bg-destructive-subtle hover:text-destructive'
